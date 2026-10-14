import React, { useState, useEffect } from 'react';
import { pizzaApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  Flame, 
  Sparkles, 
  Clock, 
  Star, 
  Plus, 
  Check, 
  SlidersHorizontal, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const HomeMenu = ({ onNavigateToBuilder, onNavigateToCheckout }) => {
  const [pizzas, setPizzas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await pizzaApi.getAll();
        if (res.success && res.data) {
          setPizzas(res.data);
        }
      } catch (err) {
        console.error('Error fetching pizza menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, []);

  const handleQuickAdd = (pizza) => {
    addToCart({
      type: 'preset',
      pizzaName: pizza.name,
      unitPrice: pizza.basePrice,
      customization: pizza.ingredients || {
        base: 'Hand Tossed',
        sauce: 'Classic Marinara',
        cheese: 'Mozzarella',
        vegetables: [],
      },
    });
    setAddedId(pizza._id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const categories = ['All', 'Veg', 'Gourmet'];
  const filteredPizzas = pizzas.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <div>
      {/* Hero Showcase Section */}
      <section style={{
        padding: '60px 0 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(249, 115, 22, 0.12)', border: '1px solid rgba(249, 115, 22, 0.3)', marginBottom: '18px' }}>
              <Flame size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Wood-Fired & Stone Oven Baked
              </span>
            </div>

            <h1 style={{
              fontSize: '48px',
              lineHeight: 1.15,
              fontWeight: '800',
              marginBottom: '20px',
            }}>
              Authentic Gourmet <br />
              <span className="gradient-text">Artisan Pizzas</span> Handcrafted Fresh.
            </h1>

            <p style={{
              fontSize: '17px',
              color: 'var(--text-muted)',
              marginBottom: '32px',
              maxWidth: '540px',
              lineHeight: 1.6,
            }}>
              Slow-fermented Neapolitan dough, Italian San Marzano tomatoes, and 100% fresh buffalo mozzarella. Order our signature recipes or craft your own in our interactive 4-step custom studio with live inventory sync!
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={onNavigateToBuilder}
                className="btn-primary"
                style={{ padding: '14px 28px', fontSize: '15px' }}
              >
                <Sparkles size={18} />
                <span>Build Custom Pizza</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="#menu-section"
                className="btn-secondary"
                style={{ padding: '14px 24px', fontSize: '15px' }}
              >
                <span>Explore Varieties</span>
              </a>
            </div>

            {/* Micro Feature Highlights */}
            <div style={{
              display: 'flex',
              gap: '24px',
              marginTop: '40px',
              paddingTop: '28px',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>5 Bases</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Handcrafted doughs</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>5 Sauces</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Slow-simmered recipes</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>Live Stock</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-deducted inventory</div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Graphic */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              position: 'relative',
              display: 'inline-block',
              padding: '20px',
            }}>
              {/* Glowing Background Disc */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(225, 29, 72, 0.3) 0%, rgba(249, 115, 22, 0.15) 50%, transparent 70%)',
                filter: 'blur(30px)',
                zIndex: 0,
              }} />

              {/* Pizza Graphic Canvas / SVG */}
              <div
                className="animate-spin-slow"
                style={{
                  width: '320px',
                  height: '320px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #f59e0b 0%, #b45309 60%, #78350f 100%)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 25px rgba(0,0,0,0.5)',
                  border: '8px solid #92400e',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  zIndex: 1,
                }}
              >
                {/* Inner Sauce & Cheese */}
                <div style={{
                  width: '260px',
                  height: '260px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #fde047 30%, #dc2626 85%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 15px rgba(0,0,0,0.4)',
                  fontSize: '44px',
                }}>
                  🍕
                </div>
              </div>

              {/* Floating feature pills */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '-10px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 2,
              }}>
                <Zap size={18} color="#eab308" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Express Delivery</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Under 25 mins</div>
                </div>
              </div>

              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '-10px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 2,
              }}>
                <ShieldCheck size={18} color="#10b981" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Razorpay Test Pay</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Instant Checkout</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Catalog Section */}
      <section id="menu-section" style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <div className="badge badge-warning" style={{ marginBottom: '8px' }}>
                Wood-Fired Catalog
              </div>
              <h2 style={{ fontSize: '32px' }}>Available Pizza Varieties</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                Each pizza is baked fresh to order with our signature ingredient combinations.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    background: selectedCategory === cat ? 'var(--grad-brand)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                    border: selectedCategory === cat ? 'none' : '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pizza Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '28px',
          }}>
            {filteredPizzas.map((pizza) => {
              const isAdded = addedId === pizza._id;
              return (
                <div
                  key={pizza._id || pizza.name}
                  className="glass-panel"
                  style={{
                    padding: '26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  }}
                >
                  {/* Top Bar with Badge & Category */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span className={pizza.category === 'Veg' ? 'badge badge-success' : 'badge badge-danger'}>
                        {pizza.category}
                      </span>
                      {pizza.badge && (
                        <span className="badge badge-warning">
                          {pizza.badge}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '21px', marginBottom: '4px', color: '#ffffff' }}>
                      {pizza.name}
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '10px' }}>
                      {pizza.tagline}
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '16px' }}>
                      {pizza.description}
                    </p>

                    {/* Ingredients Chips */}
                    {pizza.ingredients && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)' }}>
                          Base: {pizza.ingredients.base}
                        </span>
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)' }}>
                          Sauce: {pizza.ingredients.sauce}
                        </span>
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)' }}>
                          Cheese: {pizza.ingredients.cheese}
                        </span>
                        {pizza.ingredients.veggies?.map((v) => (
                          <span key={v} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Meta & Action */}
                  <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Price</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>
                        ${pizza.basePrice.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={onNavigateToBuilder}
                        className="btn-secondary"
                        title="Customize this style in Custom Studio"
                        style={{ padding: '9px 12px', fontSize: '12px' }}
                      >
                        <SlidersHorizontal size={14} />
                        <span>Customize</span>
                      </button>

                      <button
                        onClick={() => handleQuickAdd(pizza)}
                        className={isAdded ? 'btn-secondary' : 'btn-primary'}
                        style={{
                          padding: '9px 16px',
                          fontSize: '13px',
                          background: isAdded ? 'rgba(16, 185, 129, 0.2)' : undefined,
                          borderColor: isAdded ? '#10b981' : undefined,
                          color: isAdded ? '#34d399' : undefined,
                        }}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Quick Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeMenu;
