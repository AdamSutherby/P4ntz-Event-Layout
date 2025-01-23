import { NextResponse } from "next/server"

// Define an interface for your goals data
interface Goal {
  id?: string;
  title: string;
  description?: string;
  completed?: boolean;
}

// Use a more specific type instead of any
let goalsData: Goal | null = null

export async function GET() {
  return NextResponse.json(goalsData || {})
}

export async function POST(request: Request) {
  const data: Goal = await request.json()
  goalsData = data
  return NextResponse.json({ success: true })
}