#!/usr/bin/env node

const { ArchitecturalAnalyzer } = require('../lib/architecture-analyzer/core');
const { FeedbackLoopManager } = require('../lib/architecture-analyzer/feedback-loop');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function runAnalysis() {
  console.log('🚀 Starting IPC Architecture Analysis...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration. Please check your environment variables.');
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const analysisType = args.includes('--partial') ? 'partial' : 
                       args.includes('--ui') ? 'ui' :
                       args.includes('--backend') ? 'backend' :
                       args.includes('--security') ? 'security' :
                       args.includes('--performance') ? 'performance' : 'full';

  const deepScan = args.includes('--deep');
  const exportReport = args.includes('--export');

  console.log(`📊 Analysis Type: ${analysisType}`);
  console.log(`🔍 Deep Scan: ${deepScan ? 'Enabled' : 'Disabled'}`);
  console.log(`📄 Export Report: ${exportReport ? 'Enabled' : 'Disabled'}\n`);

  // Configure analysis
  const config = {
    projectPath: path.resolve(__dirname, '..'),
    analysisType,
    mlModelVersion: 'v2.1.4',
    includePatterns: [],
    excludePatterns: ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'],
    deepScan
  };

  try {
    // Initialize analyzer
    const analyzer = new ArchitecturalAnalyzer(supabaseUrl, supabaseKey, config);

    // Start analysis
    console.log('🔄 Running analysis...\n');
    await analyzer.startAnalysis();

    // Get results from database
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the latest run
    const { data: latestRun } = await supabase
      .from('architecture_analysis_runs')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

    if (latestRun) {
      console.log('✅ Analysis Complete!\n');
      console.log('📈 Results Summary:');
      console.log(`   - Health Score: ${latestRun.overall_health_score}%`);
      console.log(`   - Components Analyzed: ${latestRun.total_components_analyzed}`);
      console.log(`   - Issues Found: ${latestRun.total_issues_found}`);
      console.log(`   - Opportunities Found: ${latestRun.total_opportunities_found}`);
      console.log(`   - Duration: ${calculateDuration(latestRun.start_time, latestRun.end_time)}`);

      // Get top issues
      const { data: topIssues } = await supabase
        .from('architecture_issues')
        .select('*')
        .eq('analysis_run_id', latestRun.id)
        .order('impact_score', { ascending: false })
        .limit(5);

      if (topIssues && topIssues.length > 0) {
        console.log('\n🔴 Top Issues:');
        topIssues.forEach((issue, index) => {
          console.log(`   ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
          console.log(`      Impact: ${issue.impact_score}/100 | Confidence: ${issue.detection_confidence}%`);
        });
      }

      // Get top opportunities
      const { data: topOpportunities } = await supabase
        .from('optimization_opportunities')
        .select('*')
        .eq('analysis_run_id', latestRun.id)
        .order('priority', { ascending: false })
        .limit(5);

      if (topOpportunities && topOpportunities.length > 0) {
        console.log('\n🟢 Top Optimization Opportunities:');
        topOpportunities.forEach((opp, index) => {
          console.log(`   ${index + 1}. ${opp.title}`);
          console.log(`      Impact: +${opp.estimated_impact}% | Priority: ${opp.priority}/10 | Complexity: ${opp.implementation_complexity}`);
        });
      }

      // Export report if requested
      if (exportReport) {
        await exportAnalysisReport(supabase, latestRun);
      }

      console.log('\n📊 View detailed results in the dashboard:');
      console.log('   http://localhost:3000/architecture-analysis\n');
    }

    // Cleanup
    await analyzer.cleanup();

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

function calculateDuration(startTime, endTime) {
  if (!endTime) return 'In progress...';
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

async function exportAnalysisReport(supabase, run) {
  console.log('\n📄 Exporting analysis report...');

  const report = {
    metadata: {
      runId: run.id,
      runNumber: run.run_number,
      analysisType: run.analysis_type,
      startTime: run.start_time,
      endTime: run.end_time,
      mlModelVersion: run.ml_model_version
    },
    summary: {
      overallHealthScore: run.overall_health_score,
      totalComponentsAnalyzed: run.total_components_analyzed,
      totalIssuesFound: run.total_issues_found,
      totalOpportunitiesFound: run.total_opportunities_found
    },
    issues: [],
    opportunities: [],
    patterns: [],
    components: []
  };

  // Get all issues
  const { data: issues } = await supabase
    .from('architecture_issues')
    .select('*')
    .eq('analysis_run_id', run.id)
    .order('severity', { ascending: true });

  report.issues = issues || [];

  // Get all opportunities
  const { data: opportunities } = await supabase
    .from('optimization_opportunities')
    .select('*')
    .eq('analysis_run_id', run.id)
    .order('priority', { ascending: false });

  report.opportunities = opportunities || [];

  // Get patterns
  const { data: patterns } = await supabase
    .from('architecture_patterns')
    .select('*')
    .order('occurrences', { ascending: false })
    .limit(50);

  report.patterns = patterns || [];

  // Get components
  const { data: components } = await supabase
    .from('system_components')
    .select('*')
    .eq('is_active', true);

  report.components = components || [];

  // Save report to file
  const reportPath = path.resolve(__dirname, `../analysis-report-${run.run_number}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`✅ Report exported to: ${reportPath}`);

  // Generate markdown summary
  const markdownPath = path.resolve(__dirname, `../analysis-report-${run.run_number}.md`);
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(markdownPath, markdown);

  console.log(`✅ Markdown report exported to: ${markdownPath}`);
}

function generateMarkdownReport(report) {
  let markdown = `# Architecture Analysis Report\n\n`;
  markdown += `**Run ID:** ${report.metadata.runNumber}\n`;
  markdown += `**Date:** ${new Date(report.metadata.startTime).toLocaleString()}\n`;
  markdown += `**Analysis Type:** ${report.metadata.analysisType}\n`;
  markdown += `**ML Model Version:** ${report.metadata.mlModelVersion}\n\n`;

  markdown += `## Summary\n\n`;
  markdown += `- **Overall Health Score:** ${report.summary.overallHealthScore}%\n`;
  markdown += `- **Components Analyzed:** ${report.summary.totalComponentsAnalyzed}\n`;
  markdown += `- **Issues Found:** ${report.summary.totalIssuesFound}\n`;
  markdown += `- **Opportunities Found:** ${report.summary.totalOpportunitiesFound}\n\n`;

  markdown += `## Critical Issues\n\n`;
  const criticalIssues = report.issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    criticalIssues.forEach(issue => {
      markdown += `### ${issue.title}\n`;
      markdown += `- **Type:** ${issue.issue_type}\n`;
      markdown += `- **Impact:** ${issue.impact_score}/100\n`;
      markdown += `- **Description:** ${issue.description}\n`;
      if (issue.suggested_fix) {
        markdown += `- **Suggested Fix:** ${issue.suggested_fix}\n`;
      }
      markdown += `\n`;
    });
  } else {
    markdown += `*No critical issues found.*\n\n`;
  }

  markdown += `## Top Optimization Opportunities\n\n`;
  const topOpps = report.opportunities.slice(0, 10);
  topOpps.forEach((opp, index) => {
    markdown += `${index + 1}. **${opp.title}**\n`;
    markdown += `   - Type: ${opp.opportunity_type}\n`;
    markdown += `   - Expected Impact: +${opp.estimated_impact}%\n`;
    markdown += `   - Priority: ${opp.priority}/10\n`;
    markdown += `   - Complexity: ${opp.implementation_complexity}\n\n`;
  });

  markdown += `## Pattern Analysis\n\n`;
  markdown += `### Beneficial Patterns\n`;
  const beneficialPatterns = report.patterns.filter(p => p.is_beneficial);
  beneficialPatterns.slice(0, 5).forEach(pattern => {
    markdown += `- **${pattern.pattern_name}**: ${pattern.occurrences} occurrences (${pattern.confidence_score}% confidence)\n`;
  });

  markdown += `\n### Anti-Patterns Detected\n`;
  const antiPatterns = report.patterns.filter(p => !p.is_beneficial);
  antiPatterns.slice(0, 5).forEach(pattern => {
    markdown += `- **${pattern.pattern_name}**: ${pattern.occurrences} occurrences (${pattern.confidence_score}% confidence)\n`;
  });

  markdown += `\n## Component Health\n\n`;
  const unhealthyComponents = report.components
    .filter(c => c.metrics && c.metrics.maintainabilityIndex < 50)
    .slice(0, 10);

  if (unhealthyComponents.length > 0) {
    markdown += `### Components Needing Attention\n`;
    unhealthyComponents.forEach(comp => {
      markdown += `- **${comp.component_name}** (${comp.component_type})\n`;
      markdown += `  - Maintainability: ${comp.metrics.maintainabilityIndex}/100\n`;
      markdown += `  - Complexity: ${comp.metrics.cyclomaticComplexity}\n`;
      markdown += `  - Technical Debt: ${comp.metrics.technicalDebtRatio}%\n\n`;
    });
  }

  markdown += `\n---\n`;
  markdown += `*Generated by IPC Architecture Analysis Module with ML/YOLO Continuous Learning*\n`;

  return markdown;
}

// Run the analysis
runAnalysis().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});