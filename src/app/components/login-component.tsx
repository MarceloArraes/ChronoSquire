import Link from "next/link"




export const LoginComponent = () => {

    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-amber-700/30 bg-amber-100/50 p-8 text-center shadow-md">
            <p className="mb-4 font-serif text-lg italic text-amber-900">
                Pray, declare thyself to view thy weekly tallies.
            </p>
            <Link
                href="/api/auth/signin"
                className="rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md"
            >
                Declare Thyself
            </Link>
        </div> 
    )
}