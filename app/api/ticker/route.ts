import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(null, { status: 204 })
}

export async function POST(request: Request) {
  // Option 1: Ignore the variable with an underscore
  const _data = await request.json()

  // Option 2: If you might use the data later
  // const data = await request.json()
  // Perform operations with data here...

  return NextResponse.json({ success: true })
}