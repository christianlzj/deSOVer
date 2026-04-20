// CO2 Equivalence Metrics - 15 different ways to understand carbon impact
// All calculations based on EPA/IPCC standards

export const co2Equivalences = [
  {
    id: 'trees',
    icon: '🌲',
    singular: 'tree-day',
    plural: 'tree-days',
    description: 'to absorb',
    calculate: (co2Lbs) => {
      // 1 mature tree absorbs ~20kg CO2/year = 54.8g/day
      const co2Kg = co2Lbs * 0.453592;
      const kgPerDay = 20 / 365;
      return Math.round((co2Kg / kgPerDay) * 10) / 10;
    },
  },
  {
    id: 'burgers',
    icon: '🍔',
    singular: 'beef burger',
    plural: 'beef burgers',
    description: 'produced',
    calculate: (co2Lbs) => {
      // Beef production: ~27kg CO₂ per kg beef; burger ≈ 150g
      const co2Kg = co2Lbs * 0.453592;
      const kgPerBurger = 27 * 0.15; // 4.05
      return Math.round((co2Kg / kgPerBurger) * 10) / 10;
    },
  },
  {
    id: 'phoneCharges',
    icon: '📱',
    singular: 'phone',
    plural: 'phone',
    description: 'charges',
    calculate: (co2Lbs) => {
      // Smartphone charge ≈ 17g CO₂
      const co2G = co2Lbs * 453.592;
      return Math.round((co2G / 17) * 10) / 10;
    },
  },
  {
    id: 'carMiles',
    icon: '🚗',
    singular: 'mile driven',
    plural: 'miles driven',
    description: '(car)',
    calculate: (co2Lbs) => {
      // Avg car: 0.85 lbs CO₂/mile
      return Math.round((co2Lbs / 0.85) * 10) / 10;
    },
  },
  {
    id: 'gasoline',
    icon: '⛽',
    singular: 'gallon',
    plural: 'gallons',
    description: 'of gasoline',
    calculate: (co2Lbs) => {
      // Burning 1 gal gas = 19.6 lbs CO₂
      return Math.round((co2Lbs / 19.6) * 100) / 100;
    },
  },
  {
    id: 'cheeseburgers',
    icon: '🧀',
    singular: 'cheeseburger',
    plural: 'cheeseburgers',
    description: 'produced',
    calculate: (co2Lbs) => {
      // Cheeseburger ≈ 6.6 kg CO₂ (higher than beef alone due to cheese)
      const co2Kg = co2Lbs * 0.453592;
      return Math.round((co2Kg / 6.6) * 10) / 10;
    },
  },
  {
    id: 'flightHours',
    icon: '✈️',
    singular: 'hour of flight',
    plural: 'hours of flight',
    description: 'per passenger',
    calculate: (co2Lbs) => {
      // ~95g CO₂ per hour per passenger (avg flight)
      const co2G = co2Lbs * 453.592;
      return Math.round((co2G / 95) * 10) / 10;
    },
  },
  {
    id: 'laundry',
    icon: '🧺',
    singular: 'laundry load',
    plural: 'laundry loads',
    description: 'washed',
    calculate: (co2Lbs) => {
      // Washing machine ≈ 2.3 kg CO₂/load
      const co2Kg = co2Lbs * 0.453592;
      return Math.round((co2Kg / 2.3) * 10) / 10;
    },
  },
  {
    id: 'dishwasher',
    icon: '🍽️',
    singular: 'dishwasher',
    plural: 'dishwasher',
    description: 'runs',
    calculate: (co2Lbs) => {
      // Dishwasher ≈ 400g CO₂/run
      const co2G = co2Lbs * 453.592;
      return Math.round((co2G / 400) * 10) / 10;
    },
  },
  {
    id: 'netflix',
    icon: '🎬',
    singular: 'hour of Netflix',
    plural: 'hours of Netflix',
    description: 'watched',
    calculate: (co2Lbs) => {
      // Streaming ≈ 36g CO₂/hour
      const co2G = co2Lbs * 453.592;
      return Math.round((co2G / 36) * 10) / 10;
    },
  },
  {
    id: 'plasticBags',
    icon: '🛍️',
    singular: 'plastic bag',
    plural: 'plastic bags',
    description: 'produced',
    calculate: (co2Lbs) => {
      // Plastic bag ≈ 12g CO₂
      const co2G = co2Lbs * 453.592;
      return Math.round((co2G / 12) * 0.1) / 0.1;
    },
  },
  {
    id: 'plasticBottles',
    icon: '🍾',
    singular: 'plastic bottle',
    plural: 'plastic bottles',
    description: 'produced',
    calculate: (co2Lbs) => {
      // Plastic bottle ≈ 82g CO₂
      const co2G = co2Lbs * 453.592;
      return Math.round((co2G / 82) * 10) / 10;
    },
  },
  {
    id: 'electricity',
    icon: '💡',
    singular: 'kWh of electricity',
    plural: 'kWh of electricity',
    description: 'from grid',
    calculate: (co2Lbs) => {
      // US grid avg: 0.92 lbs CO₂/kWh
      return Math.round((co2Lbs / 0.92) * 10) / 10;
    },
  },
  {
    id: 'beefSteak',
    icon: '🥩',
    singular: 'beef steak (8oz)',
    plural: 'beef steaks (8oz)',
    description: 'produced',
    calculate: (co2Lbs) => {
      // Beef steak ≈ 6.8 kg CO₂ (8oz/227g)
      const co2Kg = co2Lbs * 0.453592;
      return Math.round((co2Kg / 6.8) * 10) / 10;
    },
  },
  {
    id: 'paperReams',
    icon: '📄',
    singular: 'ream of paper (500 sheets)',
    plural: 'reams of paper (500 sheets)',
    description: 'produced',
    calculate: (co2Lbs) => {
      // Paper production ≈ 1.6 kg CO₂/ream (500 sheets)
      const co2Kg = co2Lbs * 0.453592;
      return Math.round((co2Kg / 1.6) * 10) / 10;
    },
  },
];

// Utility function to select 3 random equivalences
export const getRandomEquivalences = (count = 3) => {
  const shuffled = [...co2Equivalences].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Format a value for display
export const formatValue = (value) => {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  if (value >= 1) {
    return Math.round(value * 10) / 10;
  }
  return value.toFixed(2);
};
