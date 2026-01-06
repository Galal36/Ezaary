import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
}

export default function CategoryCard({ id, name, image }: CategoryCardProps) {
  return (
    <Link to={`/category/${id}`}>
      <div className="group relative w-full aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Background Image */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-category.jpg";
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/0" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h3 className="text-white font-bold text-lg md:text-xl lg:text-2xl max-w-xs px-2">
            {name}
          </h3>

          {/* Icon on Hover */}
          <div className="mt-4 p-2 rounded-full bg-accent text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
