"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">India&apos;s First Exam Rewards Platform</span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance">
          Your Exam Journey,{" "}
          <span className="text-primary">Rewarded</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Get exclusive deals on travel, food and hotels near your exam centre. 
          Plus, unlock scholarships based on your results.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="/register">
  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
    Register Now
    <ArrowRight className="w-5 h-5" />
  </Button>
</a>      
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-border text-foreground hover:bg-secondary">
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-16 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">500+</div>
            <div className="text-sm text-muted-foreground">Students Registered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">10+</div>
            <div className="text-sm text-muted-foreground">Partner Merchants</div>
          </div>
          <div className="text-2xl text-center">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">₹50L+</div>
            <div className="text-sm text-muted-foreground">Scholarships Available</div>
          </div>
        </div>
      </div>
    </section>
  )
}
