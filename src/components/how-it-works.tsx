import { Card, CardContent } from "@/components/ui/card"
import { IdCard, MapPin, Trophy } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: IdCard,
    title: "Register with your Admit Card",
    description: "Simply upload your exam admit card to verify your student status and get started instantly.",
  },
  {
    step: "02",
    icon: MapPin,
    title: "Get Deals Near Your Exam Centre",
    description: "Access exclusive discounts on hotels, travel, and food options near your examination venue.",
  },
  {
    step: "03",
    icon: Trophy,
    title: "Upload Your Result to Unlock Scholarships",
    description: "Share your exam results and qualify for merit-based scholarships and rewards.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">How it works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4 text-balance">
            Three Simple Steps to Rewards
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Getting started with ExamGo is easy. Follow these steps to unlock exclusive benefits.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item, index) => (
            <Card
              key={index}
              className="group relative bg-card border-border hover:border-primary/50 transition-all duration-300"
            >
              <CardContent className="p-6 sm:p-8">
                {/* Step number */}
                <span className="text-6xl sm:text-7xl font-bold text-secondary/50 absolute top-4 right-6">
                  {item.step}
                </span>

                {/* Icon */}
                <div className="relative z-10 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 relative z-10">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
