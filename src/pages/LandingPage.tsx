import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ChevronRight, Shield, BarChart3, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export default function LandingPage() {
  const titleRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
  <header className="absolute top-0 left-0 right-0 z-50 topbar">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-white" />
            <span className="text-xl font-bold tracking-tight text-white">
              REAL ESTATE <span className="text-accent">INVESTOR</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-white">
              Home
            </a>
            <a href="#about" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              About
            </a>
            <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              All Projects
            </a>
            <a href="#news" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              News & Updates
            </a>
            <a href="#contact" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="border-white/20 hover:bg-white/6">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-accent text-accent-foreground px-5">
                Invest Now!
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-start overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center hero-bg"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32">
          <div ref={titleRef} className={`max-w-2xl hero-title ${isVisible ? 'is-visible' : ''}`}>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
              Invest & Grow.
              <br />
              <span className="text-accent">Built for long-term</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-xl">
              Strategic real estate investments built for long-term value.
              We protect your capital by investing only in properties that meet our investment criteria.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6">
                  Invest Now <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="border-white/30  hover:bg-white/10 hover:text-white text-base px-8 py-6">
                  Know More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Your Investment Portfolio, <span className="text-accent">Simplified.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Access all your projects, documents, and transactions in one secure portal.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BarChart3, title: "Portfolio Dashboard", desc: "Real-time overview of all your investments across entities." },
              { icon: FileText, title: "Tax & Financial Docs", desc: "K-1s, balance sheets, and P&L statements organized by year." },
              { icon: Shield, title: "Secure Access", desc: "Role-based access with admin approval for maximum security." },
              { icon: Users, title: "Multi-Entity Support", desc: "Manage investments across multiple companies seamlessly." },
            ].map((feat) => (
              <div key={feat.title} className="feature-card group rounded-xl border bg-card p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent mb-5">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section with background image (hero-style, left heading / right content) */}
      <section id="about" className="relative">
        {/* Use an <img> tag so attributes and SSR-related data can be preserved (as requested) */}
        <img
          src="https://static.wixstatic.com/media/c837a6_44e3014997b64b829ef10d8761ce79ee~mv2.jpg/v1/fill/w_1351,h_468,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/c837a6_44e3014997b64b829ef10d8761ce79ee~mv2.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: '1689px', height: '485px', objectFit: 'cover', objectPosition: '50% 50%' }}
          width={980}
          height={485}
          data-ssr-src-done="true"
          fetchPriority="high"
        />
        {/* dark overlay so white text reads well */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold leading-tight md:text-5xl">About Company </h2>
              <p className="mt-4 text-lg text-white/90">Empowering Investors to Succeed — Together</p>
            </div>

            <div className="text-white/90">
              <p className="mb-4">
                At Real Estate Investment, we are committed to empowering investors by providing full transparency across every transaction and ensuring every investor has a voice in key decisions. Our goal is to responsibly transition properties out of liability as quickly as possible while focusing on building sustainable revenue streams.
              </p>
              <p className="mb-4">
                We invest alongside our partners because we strongly believe in every project we take on. Our success is directly tied to yours. Together, let’s build our future.
              </p>
              <div>
                <Link to="/projects">
                  <Button variant="outline" className="bg-white/10">Discover More</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Slider */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">What Our <span className="text-accent">Investors Say</span></h2>
          </div>

          {/* Slider container */}
          <div className="relative">
            {/* slides data */}
            {(() => {
              const slides = [
                {
                  initials: 'JM',
                  name: 'James Mitchell',
                  role: 'Software Engineer, Houston TX',
                  quote: 'Real Estate gave me access to real estate deals I never could have done alone. The transparency is unmatched — I get full financials every quarter.'
                },
                {
                  initials: 'SR',
                  name: 'Sarah Rodriguez',
                  role: 'Nurse Practitioner, Dallas TX',
                  quote: "I've been investing with Real Estate for 2 years now. My portfolio has grown 34% and I haven't had to do anything — truly passive income."
                },
                {
                  initials: 'DK',
                  name: 'David Kim',
                  role: 'Business Owner, Austin TX',
                  quote: 'The voting rights feature is incredible. I feel like a real partner, not just a number. The team communicates every step of the way.'
                }
              ];

              const prev = () => setSlide((s) => (s - 1 + slides.length) % slides.length);
              const next = () => setSlide((s) => (s + 1) % slides.length);

              return (
                <>
                  <button onClick={prev} aria-label="Previous" className="carousel-arrow left-4 md:left-8">
                    ‹
                  </button>
                  <button onClick={next} aria-label="Next" className="carousel-arrow right-4 md:right-8">
                    ›
                  </button>

                  <div className="overflow-hidden">
                    <div className="flex items-center justify-center">
                      {slides.map((t, i) => (
                        <div
                          key={t.name}
                          className={`slide max-w-2xl w-full ${i === slide ? 'active' : ''}`}
                          aria-hidden={i !== slide}
                          style={{ display: i === slide ? 'block' : 'none' }}
                        >
                          <div className="rounded-xl border bg-card p-10 shadow-testimonial">
                            <div className="text-yellow-400 mb-4">★★★★★</div>
                            <p className="text-muted-foreground italic mb-6">"{t.quote}"</p>
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent/80 to-primary flex items-center justify-center text-white font-semibold">{t.initials}</div>
                              <div>
                                <p className="font-semibold text-foreground">{t.name}</p>
                                <p className="text-sm text-muted-foreground">{t.role}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* dots */}
                  <div className="flex items-center justify-center gap-3 mt-6">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSlide(i)}
                        className={`h-2 w-2 rounded-full ${i === slide ? 'bg-foreground' : 'bg-muted-foreground/40'}`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-primary py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-accent" />
              <span className="font-bold text-primary-foreground">Company </span>
            </div>
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Company . All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/login" className="text-sm text-primary-foreground/60 hover:text-primary-foreground">
                Investor Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
