import React from 'react';

const toppingColors = {
  'Black Olives': '#1e293b',
  'Bell Peppers': '#22c55e',
  'Portobello Mushrooms': '#a8a29e',
  'Pickled Jalapeños': '#84cc16',
  'Red Onions': '#c084fc',
  'Sweet Corn': '#facc15',
  'Baby Spinach': '#15803d',
  'Sun-dried Tomatoes': '#dc2626',
};

const sauceColorMap = {
  'Classic Marinara': '#dc2626',
  'Creamy Garlic Alfredo': '#fef08a',
  'Spicy Peri Peri': '#ea580c',
  'Pesto Genovese': '#16a34a',
  'Smokey BBQ': '#78350f',
};

const cheeseColorMap = {
  'Mozzarella': '#fef9c3',
  'Sharp Cheddar': '#fde047',
  'Ricotta & Feta': '#f8fafc',
  'Vegan Almond Cheese': '#fef3c7',
  'Aged Parmesan Shavings': '#fffbeb',
};

export const PizzaVisualizer = ({ base = 'Hand Tossed', sauce = 'Classic Marinara', cheese = 'Mozzarella', vegetables = [] }) => {
  const currentSauceColor = sauceColorMap[sauce] || '#dc2626';
  const currentCheeseColor = cheeseColorMap[cheese] || '#fef9c3';

  // Seeded coordinate offsets for realistic scattered vegetable placements
  const vegetablePositions = [
    { cx: 160, cy: 110, r: 8 },
    { cx: 215, cy: 135, r: 9 },
    { cx: 125, cy: 155, r: 8 },
    { cx: 190, cy: 185, r: 9 },
    { cx: 145, cy: 220, r: 8 },
    { cx: 225, cy: 210, r: 9 },
    { cx: 175, cy: 250, r: 8 },
    { cx: 110, cy: 195, r: 9 },
    { cx: 150, cy: 165, r: 8 },
    { cx: 240, cy: 165, r: 8 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div
        className="pizza-visualizer-container"
        style={{
          background: 'radial-gradient(circle, #2d1e18 0%, #15100e 100%)',
          border: '6px solid #452b1e',
        }}
      >
        <svg
          viewBox="0 0 320 320"
          style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}
        >
          {/* Defs for gradients and textures */}
          <defs>
            <radialGradient id="crustGrad" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="90%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>

            <radialGradient id="cheeseBurstCrust" cx="50%" cy="50%" r="50%">
              <stop offset="68%" stopColor="#f59e0b" />
              <stop offset="88%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>

            <radialGradient id="sauceGlow" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor={currentSauceColor} stopOpacity="1" />
              <stop offset="100%" stopColor={currentSauceColor} stopOpacity="0.85" />
            </radialGradient>

            <filter id="meltFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* 1. Crust Layer */}
          <circle
            cx="160"
            cy="160"
            r={base === 'Thin Crust' ? '146' : base === 'Deep Pan Crust' ? '154' : '150'}
            fill={base === 'Cheese Burst' ? 'url(#cheeseBurstCrust)' : 'url(#crustGrad)'}
            stroke="#92400e"
            strokeWidth={base === 'Deep Pan Crust' ? '8' : '4'}
          />

          {/* Crust blistering / char spots */}
          <circle cx="90" cy="50" r="3" fill="#451a03" opacity="0.6" />
          <circle cx="230" cy="65" r="4" fill="#451a03" opacity="0.6" />
          <circle cx="270" cy="190" r="3.5" fill="#451a03" opacity="0.6" />
          <circle cx="65" cy="230" r="4.5" fill="#451a03" opacity="0.5" />
          <circle cx="220" cy="275" r="3" fill="#451a03" opacity="0.7" />

          {/* 2. Sauce Spread */}
          <circle
            cx="160"
            cy="160"
            r="128"
            fill="url(#sauceGlow)"
            style={{ transition: 'all 0.5s ease' }}
          />

          {/* Sauce swirl details */}
          <path
            d="M 120 130 Q 160 110 200 140 T 170 200"
            fill="none"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* 3. Cheese Melt Layer */}
          <circle
            cx="160"
            cy="160"
            r="122"
            fill={currentCheeseColor}
            opacity="0.88"
            style={{ transition: 'all 0.4s ease' }}
            filter="url(#meltFilter)"
          />

          {/* Toasted cheese bubbles */}
          <ellipse cx="140" cy="130" rx="14" ry="10" fill="#f59e0b" opacity="0.35" />
          <ellipse cx="195" cy="170" rx="18" ry="12" fill="#d97706" opacity="0.3" />
          <ellipse cx="150" cy="210" rx="12" ry="8" fill="#f59e0b" opacity="0.4" />
          <ellipse cx="180" cy="120" rx="10" ry="7" fill="#b45309" opacity="0.25" />

          {/* 4. Vegetable Toppings Scatter */}
          {vegetables.map((veg, vIdx) => {
            const color = toppingColors[veg] || '#22c55e';
            // Offset positions for each vegetable category
            const vegOffset = (vIdx * 3) % vegetablePositions.length;

            return (
              <g key={veg} style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                {vegetablePositions.slice(0, 6).map((pos, pIdx) => {
                  const actualIdx = (pIdx + vegOffset) % vegetablePositions.length;
                  const itemPos = vegetablePositions[actualIdx];

                  if (veg === 'Black Olives') {
                    return (
                      <g key={`${veg}-${pIdx}`}>
                        <circle cx={itemPos.cx} cy={itemPos.cy} r="8" fill="#0f172a" />
                        <circle cx={itemPos.cx} cy={itemPos.cy} r="4" fill={currentCheeseColor} />
                      </g>
                    );
                  }

                  if (veg === 'Bell Peppers') {
                    return (
                      <path
                        key={`${veg}-${pIdx}`}
                        d={`M ${itemPos.cx - 8} ${itemPos.cy} Q ${itemPos.cx} ${itemPos.cy - 10} ${itemPos.cx + 8} ${itemPos.cy}`}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    );
                  }

                  if (veg === 'Portobello Mushrooms') {
                    return (
                      <path
                        key={`${veg}-${pIdx}`}
                        d={`M ${itemPos.cx - 7} ${itemPos.cy} A 7 7 0 0 1 ${itemPos.cx + 7} ${itemPos.cy} Z`}
                        fill="#78716c"
                        stroke="#44403c"
                        strokeWidth="1.5"
                      />
                    );
                  }

                  if (veg === 'Pickled Jalapeños') {
                    return (
                      <circle
                        key={`${veg}-${pIdx}`}
                        cx={itemPos.cx}
                        cy={itemPos.cy}
                        r="7"
                        fill="#65a30d"
                        stroke="#365314"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    );
                  }

                  if (veg === 'Sweet Corn') {
                    return (
                      <g key={`${veg}-${pIdx}`}>
                        <ellipse cx={itemPos.cx - 3} cy={itemPos.cy - 2} rx="4" ry="3" fill="#facc15" />
                        <ellipse cx={itemPos.cx + 3} cy={itemPos.cy + 2} rx="3.5" ry="2.5" fill="#f59e0b" />
                      </g>
                    );
                  }

                  if (veg === 'Sun-dried Tomatoes') {
                    return (
                      <rect
                        key={`${veg}-${pIdx}`}
                        x={itemPos.cx - 6}
                        y={itemPos.cy - 4}
                        width="12"
                        height="8"
                        rx="3"
                        fill="#991b1b"
                        transform={`rotate(${pIdx * 35} ${itemPos.cx} ${itemPos.cy})`}
                      />
                    );
                  }

                  if (veg === 'Baby Spinach') {
                    return (
                      <path
                        key={`${veg}-${pIdx}`}
                        d={`M ${itemPos.cx - 6} ${itemPos.cy} Q ${itemPos.cx} ${itemPos.cy - 12} ${itemPos.cx + 6} ${itemPos.cy} Q ${itemPos.cx} ${itemPos.cy + 10} ${itemPos.cx - 6} ${itemPos.cy}`}
                        fill="#15803d"
                        transform={`rotate(${pIdx * 50} ${itemPos.cx} ${itemPos.cy})`}
                      />
                    );
                  }

                  if (veg === 'Red Onions') {
                    return (
                      <path
                        key={`${veg}-${pIdx}`}
                        d={`M ${itemPos.cx - 9} ${itemPos.cy - 3} Q ${itemPos.cx} ${itemPos.cy - 9} ${itemPos.cx + 9} ${itemPos.cy - 3}`}
                        fill="none"
                        stroke="#c084fc"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        transform={`rotate(${pIdx * 40} ${itemPos.cx} ${itemPos.cy})`}
                      />
                    );
                  }

                  // Default circular topping
                  return (
                    <circle
                      key={`${veg}-${pIdx}`}
                      cx={itemPos.cx}
                      cy={itemPos.cy}
                      r="6"
                      fill={color}
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Basil garnish flakes */}
          <circle cx="160" cy="155" r="2.5" fill="#15803d" />
          <circle cx="130" cy="180" r="2" fill="#15803d" />
          <circle cx="190" cy="140" r="2" fill="#15803d" />
          <circle cx="175" cy="195" r="2" fill="#15803d" />
        </svg>
      </div>

      {/* Interactive Legend Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        <span className="badge badge-warning">Base: {base}</span>
        <span className="badge badge-danger">Sauce: {sauce}</span>
        <span className="badge badge-info">Cheese: {cheese}</span>
        {vegetables.length > 0 ? (
          <span className="badge badge-success">{vegetables.length} Veggies Added</span>
        ) : (
          <span className="badge badge-purple">No Veggies Selected</span>
        )}
      </div>
    </div>
  );
};

export default PizzaVisualizer;
