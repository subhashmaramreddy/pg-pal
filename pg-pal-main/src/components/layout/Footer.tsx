import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Building2 className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">PG Manager</span>
            </div>
            <p className="text-primary-foreground/80">
              Modern PG management solution for students and property owners.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/join" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Join PG
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Tenant Login
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Email: info@pgmanager.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: 123 College Road, City</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/60">
          <p>© {new Date().getFullYear()} PG Manager. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
