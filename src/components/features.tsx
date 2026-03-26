import { Card, CardContent } from "@/components/ui/card"
import { 
  Train, 
  Hotel, 
  UtensilsCrossed, 
  GraduationCap, 
  Clock, 
  Shield 
} from "lucide-react"

const features = [
  {
    icon: Train,
    title: "Travel Discounts",
    description: "Get up to 30% off on trains, buses, and flights to your exam city.",
  },
  {
    icon: Hotel,
    title: "Verified Accommodations",
    description: "Safe, affordable stays near exam centres with exclusive student rates.",
  },
  {
    icon: UtensilsCrossed,
    title: "Food & Meals",
    description: "Partner restaurants offering discounted meals for exam students.",
  },
  {
    icon: GraduationCap,
    title: "Merit Scholarships",
    description: "Earn scholarships ranging from ₹5,000 to ₹50,000 based on your results.",
  },
  {
    icon: Clock,
    title: "Last Minute Booking",
    description: "Emergency bookings available even 24 hours before your exam date.",
  },
  {
    icon: Shield,
    title: "Trusted & Secure",
    description: "Verified partners and secure payments for a worry-free experience.",
  },
]

export function Features() {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Features</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4 text-balance">
            Everything You Need for Exam Day
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From travel to accommodation to rewards, we&apos;ve got you covered throughout your exam journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group bg-card border-border hover:border-primary/50 transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
