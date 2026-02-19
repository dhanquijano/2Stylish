import React from "react";
import { Stylists } from "@/lib/stylists";

const groupByMainExpertise = (stylists: Stylists[]): Record<string, Stylists[]> => {
  return stylists.reduce(
    (acc, stylists) => {
      const expertise = stylists.expertise[0] || "General";
      if (!acc[expertise]) acc[expertise] = [];
      acc[expertise].push(stylists);
      return acc;
    },
    {} as Record<string, Stylists[]>,
  );
};

interface Props {
  name: string;
  stylists: Stylists[];
}

const StylistList = ({ name, stylists }: Props) => {
  const grouped = groupByMainExpertise(stylists);

  return (
    <section className="font-bebas-neue text-2xl sm:text-3xl md:text-4xl text-light-100">
      <h2 className="font-bebas-neue text-2xl sm:text-3xl md:text-4xl text-light-100">{name}</h2>

      {Object.entries(grouped).map(([id, group]) => (
        <div key={id} className="mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 capitalize">{id}</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
            {group.map((service) => (
              <li
                key={service.name}
                className="flex flex-col sm:flex-row items-center border-b pb-4 border-gray-700 gap-4 sm:gap-x-6"
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover flex-shrink-0"
                />
                <div className="w-full text-center sm:text-left"> 
                  <h4 className="text-lg sm:text-xl md:text-2xl font-semibold">{service.name}</h4>
                  <p className="text-sm sm:text-base text-gray-400 whitespace-pre-line">{service.expertise.join(", ")}</p>
                </div>
                <span className="text-base sm:text-lg font-semibold flex-shrink-0">{service.rating}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};
export default StylistList;
