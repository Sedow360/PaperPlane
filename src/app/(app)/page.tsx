'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, ShieldCheck, Users, Sparkles, ArrowRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import axios from 'axios';
import messages from '@/messages.json';
import Image from 'next/image';
//import heroImg from "./";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { ApiResponse } from '@/types/ApiResponse';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await axios.get<ApiResponse>(`/api/check-username-available?username=${username.trim()}`);
      // Got a success response + message = username is available = user doesn't exist
      if (res.data.message === "That's an unique name for sure!") {
        setError('They haven\'t built their leisure yet');
      }
    } catch (err) {
      // Request failed = username is taken = user exists → redirect
      router.replace(`/u/${username.trim()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* HERO SECTION */}
      <section className="relative flex items-center justify-center min-h-[85vh] px-6 py-12 text-left overflow-hidden" style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #1a1a4e 15%, #2d1b69 28%, #6b3fa0 45%, #c084fc 62%, #f9a8d4 76%, #fde68a 90%, #fef3c7 100%)' }}>
      {/* Noise Overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />

  <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    
    {/* LEFT COLUMN: TEXT CONTENT */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium tracking-wide" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fef3c7' }}>
              <Sparkles size={10} className="text-yellow-300" /> Anonymous · Peaceful · Belonging
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6" style={{ fontFamily: "'Georgia', serif", background: 'linear-gradient(135deg, #ffffff 0%, #fde68a 50%, #f9a8d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Share virtual paperplanes.<br />Connect with those who matter.
            </h1>

            <p className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
        PaperPlane is where candid thoughts find a home — no names, no shyness, just some messages which find their owner.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="px-8 py-6 text-base font-semibold rounded-2xl shadow-xl" style={{ background: 'linear-gradient(135deg, #6228c6, #ae5ffc)', color: 'white', border: 'none' }}>
                <Link href="/sign-up"> Create your leisure <ArrowRight size={18} className="ml-2" /> </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-2xl" style={{ background: 'rgba(19, 15, 15, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.147)', color: 'white' }}>
                <Link href="/sign-in">Visit your leisure</Link>
              </Button>
            </div>
        </div>

      {/* RIGHT COLUMN: ROUNDED IMAGE */}
        <div className="relative flex justify-center items-center">
          <div className="relative w-75 h-75 md:w-112.5 md:h-112.5 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
            <Image 
              src="/hero6.png" 
              alt="Hero background" 
              fill 
              className="object-cover"
              priority 
            />
          </div>
        {/* Decorative glow behind the circle */}
          <div className="absolute -z-10 w-[110%] h-[110%] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #c084fc, transparent)' }} />
        </div>

      </div>
    </section>


      {/* CAROUSEL SECTION */}
      <section
        className="py-20 px-4 flex flex-col items-center"
        style={{ background: 'linear-gradient(180deg, #fef3c7 0%, #fce7f3 40%, #ede9fe 100%)' }}
      >
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#7c3aed' }}>
            What your close ones want to say
          </p>
          <h2 className="text-3xl md:text-4xl font-black" style={{ color: '#1e1b4b', fontFamily: "'Georgia', serif" }}>
            Real Messages, Real Closure
          </h2>
        </div>

        <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-lg md:max-w-2xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card
                  className="rounded-3xl shadow-xl border-0"
                  style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)' }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #c084fc)' }}>
                        <Mail size={14} className="text-white" />
                      </div>
                      <CardTitle className="text-base font-bold" style={{ color: '#1e1b4b' }}>
                        {message.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#374151' }}>
                      {message.content}
                    </p>
                    <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>
                      {message.received}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section
        className="py-24 px-6"
        style={{ background: 'linear-gradient(180deg, #ede9fe 0%, #e0f2fe 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#7c3aed' }}>
              Simple by design
            </p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: '#1e1b4b', fontFamily: "'Georgia', serif" }}>
              How PaperPlane Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users size={28} />,
                step: '01',
                title: 'Create Your Leisure',
                desc: 'Sign up in seconds and get your unique leisure link to share with anyone.',
              },
              {
                icon: <Mail size={28} />,
                step: '02',
                title: 'Receive paperplanes',
                desc: 'People send you honest, anonymous messages to your leisure —  fate guides them.',
              },
              {
                icon: <ShieldCheck size={28} />,
                step: '03',
                title: 'Stay Anonymous',
                desc: 'Senders are always protected. You read the message, they get their closure from a far. Always.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-8 rounded-3xl"
                style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.8)' }}
              >
                <span className="absolute top-6 right-6 text-5xl font-black opacity-10" style={{ color: '#7c3aed' }}>
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'linear-gradient(135deg, #7c3aed20, #c084fc30)', color: '#7c3aed' }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1e1b4b' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USERNAME LOOKUP SECTION */}
      <section
        className="py-24 px-6"
        style={{ background: 'linear-gradient(180deg, #e0f2fe 0%, #fce7f3 100%)' }}
      >
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#7c3aed' }}>
            Find someone
          </p>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#1e1b4b', fontFamily: "'Georgia', serif" }}>
            Send paperplanes to their leisure
          </h2>
          <p className="text-sm mb-10 leading-relaxed" style={{ color: '#6b7280' }}>
            Enter a username and we&apos;ll get your paperplanes ready to be sent — they&apos;ll never know it was you.
          </p>

          <div
            className="p-6 rounded-3xl shadow-xl"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)' }}
          >
            <div className="flex gap-3 items-center">
              {/* @ prefix */}
              <span className="text-lg font-bold select-none" style={{ color: '#c084fc' }}>@</span>

              {/* Input */}
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="Enter username"
                className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:font-normal"
                style={{ color: '#1e1b4b', caretColor: '#7c3aed' }}
              />

              {/* Go button */}
              <button
                onClick={handleLookup}
                disabled={loading || !username.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={15} />
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="mt-4 border-t" style={{ borderColor: 'rgba(124,58,237,0.1)' }} />

            {/* Error or hint */}
            {error ? (
              <p className="mt-4 text-sm font-medium text-center" style={{ color: '#ef4444' }}>
                {error}
              </p>
            ) : (
              <p className="mt-4 text-xs text-center" style={{ color: '#9ca3af' }}>
                You&apos;ll be able to write to someone
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section
        className="py-20 px-6 flex flex-col items-center text-center"
        style={{ background: 'linear-gradient(160deg, #fde68a 0%, #f9a8d4 50%, #c084fc 100%)' }}
      >
        <h2 className="text-3xl md:text-5xl font-black mb-4 max-w-2xl" style={{ color: '#1e1b4b', fontFamily: "'Georgia', serif" }}>
          Ready to read what people really think about you?
        </h2>
        <p className="text-base mb-10 max-w-md" style={{ color: '#374151' }}>
          Join thousands already using PaperPlane to grow, connect, and read the messages meant for you.
        </p>
        <Button
          asChild
          size="lg"
          className="px-10 py-6 text-base font-bold rounded-2xl shadow-2xl"
          style={{ background: '#1e1b4b', color: 'white', border: 'none' }}
        >
          <Link href="/sign-up">
            Start your journey <ArrowRight size={18} className="ml-2" />
          </Link>
        </Button>
      </section>

      {/* FOOTER */}
      <footer
        className="text-center py-8 px-4"
        style={{ background: '#0f0c29', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}
      >
        <p>© 2026 PaperPlane. All rights reserved.</p>
      </footer>
    </div>
  );
}