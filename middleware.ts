import { NextResponse, type NextRequest } from "next/server";

const ACCESS_COOKIE = "opsleak_access";

function configuredKey(): string | undefined {
  const key = process.env.OPSLEAK_ACCESS_KEY?.trim();
  return key && key.length >= 12 ? key : undefined;
}

function sameSecret(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function middleware(request: NextRequest) {
  const key = configuredKey();
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (!key) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Acceso no configurado.", { status: 503 });
    }

    return NextResponse.next();
  }

  const presented = request.cookies.get(ACCESS_COOKIE)?.value ?? "";

  if (sameSecret(presented, key)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
