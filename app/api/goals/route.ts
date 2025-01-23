import { NextResponse } from "next/server"

let goalsData: any = null

export async function GET() {
  return NextResponse.json(goalsData || {})
}

export async function POST(request: Request) {
  const data = await request.json()
  goalsData = data
  return NextResponse.json({ success: true })
}

