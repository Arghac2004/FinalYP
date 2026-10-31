"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {
    return (
        <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 overflow-hidden">
            {/* Soft background blob */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-100/60 to-transparent dark:from-blue-950/30 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

            <div className="relative container mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 mb-6 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    AI-Powered Finance Platform
                </div>

                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[96px] font-extrabold leading-[1.05] tracking-tight bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent pb-4 mb-6">
                    Manage Your Finances <br className="hidden sm:block" />
                    with Intelligence
                </h1>

                <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-9 max-w-2xl mx-auto leading-relaxed">
                    An AI-powered financial management platform that helps you track, analyze, and optimize your spending with real-time insights.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
                    <Link href="/dashboard">
                        <Button size="lg" className="px-8 py-3 h-12 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200">
                            Get Started Free →
                        </Button>
                    </Link>
                    <Link href="https://www.youtube.com/roadsidecoder" target="_blank">
                        <Button size="lg" variant="outline" className="px-8 py-3 h-12 rounded-2xl text-base font-semibold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                            ▶ Watch Demo
                        </Button>
                    </Link>
                </div>

                {/* Dashboard Screenshot */}
                <div className="relative max-w-5xl mx-auto">
                    <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/10 to-transparent rounded-3xl blur-2xl -z-10" />
                    <Image
                        src="/banner.png"
                        alt="Rupee Radar Dashboard Preview"
                        width={1280}
                        height={720}
                        className="rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 mx-auto"
                        priority
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;