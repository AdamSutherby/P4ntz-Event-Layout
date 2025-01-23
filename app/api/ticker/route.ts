import { NextResponse } from 'next/server'

export async function GET() {
  // In a real application, this would fetch from a database
  // For now, we'll return a 204 No Content, and the client-side
  // will fall back to localStorage
  return new NextResponse(null, { status: 204 })
}

export async function POST(request: Request) {
  const data = await request.json()
  // In a real application, save to database here
  return NextResponse.json({ success: true })
}
