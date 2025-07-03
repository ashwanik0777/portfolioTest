import { Link } from "wouter";
import { Mail, MapPin, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { VisitorCounter } from "../ui/visitor-counter";

export function Footer() {
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  const { data: socials } = useQuery<any[]>({
    queryKey: ["/api/socials"],
  });

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">
              Alex<span className="text-primary">Morgan</span>
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              {profile?.bio || "A passionate Full Stack Developer specializing in building exceptional digital experiences that are responsive, accessible, and performant."}
            </p>
            <div className="flex space-x-4">
              {socials?.map((social) => (
                <a 
                  key={social.id} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <span className="sr-only">{social.name}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: social.icon }}
                  />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="#home" className="text-gray-400 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="#about" className="text-gray-400 hover:text-primary transition-colors">About</Link></li>
              <li><Link href="#skills" className="text-gray-400 hover:text-primary transition-colors">Skills</Link></li>
              <li><Link href="#projects" className="text-gray-400 hover:text-primary transition-colors">Projects</Link></li>
              <li><Link href="#experience" className="text-gray-400 hover:text-primary transition-colors">Experience</Link></li>
              <li><Link href="#contact" className="text-gray-400 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                <span>{profile?.phone || "+1 (555) 123-4567"}</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                <span>{profile?.email || "alex@example.com"}</span>
              </li>
              <li className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                <span>{profile?.location || "San Francisco, CA, USA"}</span>
              </li>
              <li className="flex items-center justify-start mt-5 text-gray-400">
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <VisitorCounter />
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col items-center justify-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} Alex Morgan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
