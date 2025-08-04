// Example database setup for Vercel Postgres
import { sql } from '@vercel/postgres'

export async function getProjects() {
  const { rows } = await sql`SELECT * FROM projects ORDER BY created_at DESC`
  return rows
}

export async function createProject(project: any) {
  const { rows } = await sql`
    INSERT INTO projects (name, city, submittal_number, permit_number, status)
    VALUES (${project.name}, ${project.city}, ${project.submittalNumber}, ${project.permitNumber}, ${project.status})
    RETURNING *
  `
  return rows[0]
}

// For development without database, use localStorage
export const useLocalStorage = process.env.NODE_ENV === 'development'