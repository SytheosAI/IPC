#!/bin/bash

# IPC Database Schema Update Script
# Run this with your Supabase service role key

echo "🚀 IPC Database Schema Update"
echo "=============================="

# Check if service role key is provided
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required"
    echo ""
    echo "Usage:"
    echo "  export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
    echo "  ./scripts/run-with-service-key.sh"
    echo ""
    echo "Or run directly:"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/update-schema-direct.js"
    exit 1
fi

# Check if URL is set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL environment variable is required"
    echo ""
    echo "Make sure your .env file contains:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    exit 1
fi

echo "🔧 Using Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "🔑 Service role key loaded"
echo ""

# Run the schema update
node scripts/update-schema-direct.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Schema update completed successfully!"
    echo "✅ Your IPC database is now optimized for production"
else
    echo ""
    echo "❌ Schema update failed"
    echo "Check the error messages above"
    exit 1
fi