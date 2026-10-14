import React, { useState, useEffect } from 'react';
import { PizzaVisualizer } from '../components/PizzaVisualizer';
import { useCart } from '../context/CartContext';
import { inventoryApi } from '../services/api';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Flame, 
  Sparkles, 
  Layers, 
  Droplet, 
  ShieldAlert, 
  ShoppingBag,
  Info
} from 'lucide-react';

export const CustomPizzaBuilder = ({ onProceedToCheckout }) => {
  const { addToCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [inventory, setInventory] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    vegetables: [],
  });
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(false);

  // User selections
  const [selectedBase, setSelectedBase] = useState('Hand Tossed');
  const [selectedSauce, setSelectedSauce] = useState('Classic Marinara');
  const [selectedCheese, setSelectedCheese] = useState('Mozzarella');
  const [selectedVegetables, setSelectedVegetables] = useState(['Sun-dried Tomatoes', 'Bell Peppers']);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await inventoryApi.getAll();
        if (res.success && res.grouped) {
          setInventory(res.grouped);
          // Auto select first available if default not available
          if (res.grouped.bases.length && !res.grouped.bases.find((b) => b.name === selectedBase)) {
            setSelectedBase(res.grouped.bases[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to load inventory for builder:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const toggleVegetable = (vegName) => {
    setSelectedVegetables((prev) => {
      if (prev.includes(vegName)) {
        return prev.filter((v) => v !== vegName);
      } else {
        return [...prev, vegName];
      }
    });
  };

  // Calculate customized pizza price
  const baseItem = inventory.bases.find((b) => b.name === selectedBase) || { price: 10.99 };
  const sauceItem = inventory.sauces.find((s) => s.name === selectedSauce) || { price: 1.50 };
  const cheeseItem = inventory.cheeses.find((c) => c.name === selectedCheese) || { price: 2.50 };
  const vegTotal = selectedVegetables.reduce((acc, vName) => {
    const v = inventory.vegetables.find((veg) => veg.name === vName);
    return acc + (v ? v.price : 1.20);
  }, 0);

  const calculatedPrice = Number((baseItem.price + sauceItem.price + cheeseItem.price + vegTotal).toFixed(2));

  const handleAddToCart = () => {
    const customPizza = {
      type: 'custom',
      pizzaName: `Masterpiece (${selectedBase})`,
      unitPrice: calculatedPrice,
      customization: {
        base: selectedBase,
        sauce: selectedSauce,
        cheese: selectedCheese,
        vegetables: selectedVegetables,
      },
    };
    addToCart(customPizza);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const steps = [
    { num: 1, label: 'Pizza Base', icon: Layers, desc: '5 Handcrafted Options' },
    { num: 2, label: 'Sauce', icon: Droplet, desc: '5 Signature Sauces' },
    { num: 3, label: 'Cheese Type', icon: Flame, desc: 'Artisanal Cheeses' },
    { num: 4, label: 'Vegetables', icon: Sparkles, desc: 'Fresh Garden Harvest' },
    { num: 5, label: 'Summary', icon: ShoppingBag, desc: 'Final Masterpiece' },
  ];

  return (
    <div className="container" style={{ padding: '36px 20px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="badge badge-warning" style={{ marginBottom: '12px' }}>
          Interactive Custom Studio
        </div>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
          Craft Your <span className="gradient-text">Signature Pizza</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
          Pick each layer with real-time live preview. All 5 bases, 5 sauces, cheeses, and garden veggies are tracked directly in our live inventory.
        </p>
      </div>

      {/* Stepper Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '36px',
        flexWrap: 'wrap',
      }}>
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;
          return (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                background: isActive 
                  ? 'var(--grad-brand)' 
                  : isDone 
                  ? 'rgba(16, 185, 129, 0.15)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#ffffff' : isDone ? '#34d399' : 'var(--text-muted)',
                border: isActive 
                  ? 'none' 
                  : isDone 
                  ? '1px solid rgba(16, 185, 129, 0.3)' 
                  : '1px solid var(--border-subtle)',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: isActive ? 'rgba(255, 255, 255, 0.25)' : isDone ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: '#fff',
              }}>
                {isDone ? <Check size={12} strokeWidth={3} /> : s.num}
              </div>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Grid: Visualizer on Left/Top, Controls on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '36px',
        alignItems: 'start',
      }}>
        {/* Visualizer Card */}
        <div className="glass-panel" style={{ padding: '32px 24px', textAlign: 'center', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span className="badge badge-info">Real-time Render</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>
              ${calculatedPrice.toFixed(2)}
            </div>
          </div>

          <PizzaVisualizer
            base={selectedBase}
            sauce={selectedSauce}
            cheese={selectedCheese}
            vegetables={selectedVegetables}
          />

          <div style={{ marginTop: '24px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Custom Recipe Breakdown
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Base: {selectedBase}</span>
              <span style={{ fontWeight: '600' }}>${baseItem.price?.toFixed(2) || '10.99'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sauce: {selectedSauce}</span>
              <span style={{ fontWeight: '600' }}>${sauceItem.price?.toFixed(2) || '1.50'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cheese: {selectedCheese}</span>
              <span style={{ fontWeight: '600' }}>${cheeseItem.price?.toFixed(2) || '2.50'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Veggies ({selectedVegetables.length}):</span>
              <span style={{ fontWeight: '600' }}>${vegTotal.toFixed(2)}</span>
            </div>
          </div>

          {addedToast && (
            <div style={{ marginTop: '16px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Check size={16} /> Pizza added to your cart!
            </div>
          )}
        </div>

        {/* Step Controls Panel */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          {/* STEP 1: PIZZA BASES (5 Options) */}
          {currentStep === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-warning">Step 1 of 4</span>
                <h2 style={{ fontSize: '22px' }}>Select Your Pizza Base</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Choose from 5 artisanal dough styles freshly kneaded in house.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(inventory.bases.length > 0 ? inventory.bases : [
                  { name: 'Thin Crust', price: 9.99, description: 'Crispy ultra-thin dough hand-rolled to golden perfection', stock: 45 },
                  { name: 'Cheese Burst', price: 12.99, description: 'Secret molten cheese core that bursts in every bite', stock: 35 },
                  { name: 'Hand Tossed', price: 10.99, description: 'Traditional Neapolitan airy crust with leopard spotting', stock: 50 },
                  { name: 'Gluten-Free Cauliflower', price: 13.99, description: 'Guilt-free artisanal keto-friendly cauliflower crust', stock: 24 },
                  { name: 'Deep Pan Crust', price: 11.99, description: 'Chicago-style thick buttery crust baked in seasoned pans', stock: 32 },
                ]).map((base) => {
                  const isSelected = selectedBase === base.name;
                  const isLow = base.stock < 20;
                  return (
                    <div
                      key={base.name}
                      onClick={() => setSelectedBase(base.name)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(249, 115, 22, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '6px solid var(--accent-primary)' : '2px solid var(--text-dim)',
                          background: '#fff',
                        }} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '16px', color: '#ffffff' }}>
                            {base.name}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {base.description}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--accent-primary)' }}>
                          ${base.price?.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                          <span className={isLow ? 'badge badge-warning' : 'badge badge-success'}>
                            {base.stock} crusts in stock
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PIZZA SAUCE (5 Options) */}
          {currentStep === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-danger">Step 2 of 4</span>
                <h2 style={{ fontSize: '22px' }}>Choose Your Sauce</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Select from 5 slow-simmered sauces crafted from vine-ripened ingredients.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(inventory.sauces.length > 0 ? inventory.sauces : [
                  { name: 'Classic Marinara', price: 1.50, description: 'Authentic San Marzano tomatoes infused with wild oregano', stock: 65 },
                  { name: 'Creamy Garlic Alfredo', price: 2.20, description: 'Velvety roasted garlic and aged parmesan cream sauce', stock: 42 },
                  { name: 'Spicy Peri Peri', price: 1.90, description: 'Fiery bird’s eye chili sauce with smoked paprika kick', stock: 38 },
                  { name: 'Pesto Genovese', price: 2.50, description: 'Fresh sweet basil, crushed pine nuts, and virgin olive oil', stock: 28 },
                  { name: 'Smokey BBQ', price: 1.80, description: 'Slow-simmered hickory smoked sweet and tangy barbecue glaze', stock: 35 },
                ]).map((sauce) => {
                  const isSelected = selectedSauce === sauce.name;
                  return (
                    <div
                      key={sauce.name}
                      onClick={() => setSelectedSauce(sauce.name)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(225, 29, 72, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                        border: isSelected ? '2px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '6px solid var(--accent-secondary)' : '2px solid var(--text-dim)',
                          background: '#fff',
                        }} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '16px', color: '#ffffff' }}>
                            {sauce.name}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {sauce.description}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--accent-secondary)' }}>
                          +${sauce.price?.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                          <span className="badge badge-success">{sauce.stock} portions</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHEESE TYPE */}
          {currentStep === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-info">Step 3 of 4</span>
                <h2 style={{ fontSize: '22px' }}>Choose Cheese Type</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Select your cheese melt layer for maximum flavor and stretch.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(inventory.cheeses.length > 0 ? inventory.cheeses : [
                  { name: 'Mozzarella', price: 2.50, description: '100% fresh buffalo mozzarella with glorious stretch', stock: 75 },
                  { name: 'Sharp Cheddar', price: 2.80, description: '18-month cave-aged sharp English cheddar', stock: 40 },
                  { name: 'Ricotta & Feta', price: 3.20, description: 'Whipped cloud-like ricotta with tangy Greek feta crumbles', stock: 30 },
                  { name: 'Vegan Almond Cheese', price: 3.50, description: 'Plant-based meltable cashew & almond artisan cheese', stock: 22 },
                  { name: 'Aged Parmesan Shavings', price: 3.00, description: 'Nutty crystals of 24-month Parmigiano Reggiano', stock: 45 },
                ]).map((ch) => {
                  const isSelected = selectedCheese === ch.name;
                  return (
                    <div
                      key={ch.name}
                      onClick={() => setSelectedCheese(ch.name)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                        border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '6px solid var(--accent-cyan)' : '2px solid var(--text-dim)',
                          background: '#fff',
                        }} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '16px', color: '#ffffff' }}>
                            {ch.name}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {ch.description}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--accent-cyan)' }}>
                          +${ch.price?.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                          <span className="badge badge-success">{ch.stock} portions</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: VEGETABLES (Multiple Select) */}
          {currentStep === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-success">Step 4 of 4</span>
                <h2 style={{ fontSize: '22px' }}>Select Vegetables (Multiple)</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Pick as many organic farm-fresh garden toppings as you like!
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px',
              }}>
                {(inventory.vegetables.length > 0 ? inventory.vegetables : [
                  { name: 'Black Olives', price: 1.20, stock: 55 },
                  { name: 'Bell Peppers', price: 1.10, stock: 60 },
                  { name: 'Portobello Mushrooms', price: 1.50, stock: 46 },
                  { name: 'Pickled Jalapeños', price: 1.20, stock: 48 },
                  { name: 'Red Onions', price: 0.90, stock: 58 },
                  { name: 'Sweet Corn', price: 1.00, stock: 52 },
                  { name: 'Baby Spinach', price: 1.30, stock: 34 },
                  { name: 'Sun-dried Tomatoes', price: 1.80, stock: 30 },
                ]).map((veg) => {
                  const isSelected = selectedVegetables.includes(veg.name);
                  return (
                    <div
                      key={veg.name}
                      onClick={() => toggleVegetable(veg.name)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                        border: isSelected ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isSelected ? 'none' : '2px solid var(--text-dim)',
                          background: isSelected ? '#10b981' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: isSelected ? '#ffffff' : 'var(--text-muted)' }}>
                          {veg.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>
                        +${veg.price?.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: FINAL SUMMARY & ADD TO CART */}
          {currentStep === 5 && (
            <div>
              <div className="badge badge-purple" style={{ marginBottom: '8px' }}>
                Order Ready
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Custom Creation Summary</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Review your selections before adding this handcrafted pizza to your cart.
              </p>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Crust Base:</span>
                  <strong style={{ color: '#fff' }}>{selectedBase}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sauce:</span>
                  <strong style={{ color: '#fff' }}>{selectedSauce}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cheese Type:</span>
                  <strong style={{ color: '#fff' }}>{selectedCheese}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vegetables:</span>
                  <strong style={{ color: '#fff', textAlign: 'right' }}>
                    {selectedVegetables.length > 0 ? selectedVegetables.join(', ') : 'None selected'}
                  </strong>
                </div>
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>Custom Pizza Total</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                    ${calculatedPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleAddToCart}
                  className="btn-primary"
                  style={{ flex: 1, padding: '14px' }}
                >
                  <ShoppingBag size={18} />
                  <span>Add Custom Pizza to Cart</span>
                </button>
                <button
                  onClick={() => {
                    handleAddToCart();
                    if (onProceedToCheckout) onProceedToCheckout();
                  }}
                  className="btn-secondary"
                  style={{ padding: '14px 20px' }}
                >
                  <span>Checkout Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
          }}>
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '14px' }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '14px' }}
              >
                <span>Next Step</span>
                <ChevronRight size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPizzaBuilder;
