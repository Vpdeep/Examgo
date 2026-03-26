import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-20 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* CTA Section */}
        <div className="text-center mb-16 pb-16 border-b border-border">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of students already saving money and earning rewards with ExamGo.
          </p>
          <Button size="lg" className="px-8 py-6 rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
            Register Now
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">How it Works</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Features</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">E</span>
            </div>
            <span className="font-semibold text-foreground">ExamGo</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} ExamGo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
