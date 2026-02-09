import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  MessageSquare,
  FileText,
  CheckCircle2,
  ArrowRight,
  Building2,
  Lock,
  Users,
  Zap,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Conversational Assessment",
    description:
      "No confusing forms. Just answer simple questions in plain English, like talking to a friendly security advisor.",
  },
  {
    icon: FileText,
    title: "Custom Policy Generation",
    description:
      "Get a complete, board-ready cybersecurity policy tailored to your organization's specific needs and risks.",
  },
  {
    icon: CheckCircle2,
    title: "Actionable Compliance",
    description:
      "Receive a prioritized checklist of security improvements with clear guidance on what to do first.",
  },
  {
    icon: Lock,
    title: "Privacy-Focused",
    description:
      "Your organization's data stays confidential. We never share or sell your assessment information.",
  },
];

const stats = [
  { value: "15min", label: "Average assessment time" },
  { value: "100+", label: "Security controls covered" },
  { value: "Plain", label: "English policies" },
];

const testimonials = [
  {
    quote:
      "OpenGuard gave us a professional security policy in 20 minutes. Our board was impressed, and we finally feel confident about our data practices.",
    author: "Maria Chen",
    role: "Executive Director",
    org: "Community Health Alliance",
  },
  {
    quote:
      "As a small nonprofit, we couldn't afford a security consultant. OpenGuard was like having a CISO on demand.",
    author: "James Wilson",
    role: "Operations Manager",
    org: "Youth Education Foundation",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">OpenGuard</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,200,190,0.05)_0%,transparent_50%)]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 text-accent-foreground text-sm font-medium mb-8">
            <Heart className="w-4 h-4" />
            Built for non-profits and community organizations
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Your AI-Powered{" "}
            <span className="text-gradient-primary">Fractional CISO</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Stop worrying about cybersecurity compliance. OpenGuard interviews your
            organization and generates a custom, plain-English security policy you
            can actually use—in minutes, not months.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" asChild className="h-12 px-8 text-base font-medium">
              <Link href="/signup">
                Start Free Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-8 text-base"
            >
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Cybersecurity shouldn&apos;t require a six-figure consultant
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Small non-profits face the same cyber threats as large corporations,
                but without the resources. Volunteer devices, donor data, and limited
                IT expertise create real vulnerabilities.
              </p>
              <ul className="space-y-3">
                {[
                  "Funders increasingly require security policies",
                  "Data breaches can destroy donor trust",
                  "Generic templates don't fit your reality",
                  "Traditional consultants charge $20,000+",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-border/50 flex items-center justify-center">
                <div className="text-center p-8">
                  <Building2 className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium">
                    &ldquo;We needed a security policy for our grant application—fast.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              How OpenGuard Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to professional cybersecurity protection
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Have a Conversation",
                description:
                  "Answer friendly questions about your organization—no technical jargon required. It's like chatting with a helpful colleague.",
                icon: MessageSquare,
              },
              {
                step: "2",
                title: "Get Your Policy",
                description:
                  "Receive a comprehensive, customized security policy written in plain English that your board and staff can understand.",
                icon: FileText,
              },
              {
                step: "3",
                title: "Take Action",
                description:
                  "Follow your personalized compliance checklist to implement security improvements, prioritized by impact.",
                icon: CheckCircle2,
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <Card className="h-full pt-4">
                  <CardContent className="pt-6">
                    <item.icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Built for Organizations Like Yours
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade security guidance designed for non-profit realities
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Trusted by Community Leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="bg-card">
                <CardContent className="p-8">
                  <p className="text-lg mb-6 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.org}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-primary/20">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                Ready to protect your organization?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Start your free security assessment today. No credit card required.
                Get your custom policy in about 15 minutes.
              </p>
              <Button size="lg" asChild className="h-12 px-8 text-base font-medium">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">OpenGuard</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} OpenGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
