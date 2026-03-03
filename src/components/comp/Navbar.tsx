"use client"

import { User } from "next-auth"
import { signOut, useSession } from "next-auth/react"
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function Navbar() {
    const {data: session} = useSession();
    const user: User = session?.user as User;
    const router = useRouter();
    const handleLogIn = () => {
        router.replace("/sign-in");
    }
    const handleLogOut = () => {
        signOut();
        router.replace("/");
    }

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 
                  bg-linear-to-r from-slate-950 via-blue-950 to-indigo-950 
                  backdrop-blur-md bg-opacity-80 border-b border-white/10 
                  shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
    
            <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold tracking-tight text-white 
                               drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] 
                               hover:text-blue-200 transition-colors">
                    PaperPlane⁀જ➣
                </Link>
            </div>

            <div className="flex items-center gap-6 text-slate-200">
                {session ? (
                    <>
                        <span className="text-sm font-medium">Welcome, <span className="text-blue-300">{user.username || user.email}</span></span>
                        <Button variant="destructive" className="bg-red-900/50 hover:bg-red-800 border border-red-500/30" onClick={() => handleLogOut()}>
                            Log Out
                        </Button>
                    </>
                    ) : (
                        <Button className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-100 border border-blue-400/30 backdrop-blur-sm"
                            onClick={() => handleLogIn()}>
                            Log In
                        </Button>
                    )
                }
            </div>
        </nav>
    );

}
