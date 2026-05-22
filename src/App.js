import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Drinks menu
const DRINKS = [
  {
    id: 'solkadhi',
    name: 'Solkadhi',
    price: 20,
    emoji: '🥥',
    tagline: 'Coastal Coolness',
  },
  {
    id: 'aam-panna',
    name: 'Aam Panna',
    price: 30,
    emoji: '🥭',
    tagline: 'Tangy, Refreshing',
  },
  {
    id: 'boba-pineapple',
    name: 'Boba Tea (Pineapple)',
    price: 50,
    emoji: '🍍',
    tagline: 'Tropical Vibes',
  },
  {
    id: 'boba-coffee',
    name: 'Boba Tea (Coffee)',
    price: 50,
    emoji: '☕',
    tagline: 'Brewed Fresh',
  },
  {
    id: 'cupcakes',
    name: 'Cup cakes',
    price: 20,
    emoji: '🧁',
    tagline: 'Sweet Treats',
  },
  {
    id: 'boat-candy',
    name: 'Boat with candy',
    price: 20,
    emoji: '🚤',
    tagline: 'Fun & Sweet',
  },
  {
    id: 'game',
    name: 'Game',
    price: 20,
    emoji: '🎮',
    tagline: 'Play & Win',
  },
];

export default function App() {
  const [cart, setCart] = useState({});
  const [status, setStatus] = useState(null);
  const [screen, setScreen] = useState('menu'); // menu, qr, code
  const [codeInput, setCodeInput] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // Calculate total
  const total = Object.entries(cart).reduce((sum, [drinkId, qty]) => {
    const drink = DRINKS.find((d) => d.id === drinkId);
    return sum + (drink ? drink.price * qty : 0);
  }, 0);

  // Get cart items with details
  const cartItems = Object.entries(cart).map(([drinkId, quantity]) => {
    const drink = DRINKS.find((d) => d.id === drinkId);
    return {
      ...drink,
      quantity,
      subtotal: drink.price * quantity,
    };
  });

  // Add item to cart
  const handleAddToCart = (drink) => {
    setCart((prev) => ({
      ...prev,
      [drink.id]: (prev[drink.id] || 0) + 1,
    }));
    setStatus(null);
  };

  // Remove item from cart
  const handleRemoveFromCart = (drinkId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      newCart[drinkId]--;
      if (newCart[drinkId] <= 0) {
        delete newCart[drinkId];
      }
      return newCart;
    });
  };

  // Clear cart
  const handleClearCart = () => {
    setCart({});
    setPendingOrderId(null);
    setScreen('menu');
  };

  // Show QR
  const handleShowQR = () => {
    if (Object.keys(cart).length === 0) return;
    const newOrderId = `SS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setPendingOrderId(newOrderId);
    setScreen('qr');
    setCodeInput('');
    setStatus(null);
  };

  // Verify code and save to Supabase
  const handleVerifyCode = async () => {
    if (codeInput !== '6202') {
      setStatus({
        type: 'error',
        message: '❌ Wrong code! Try again.',
      });
      return;
    }

    // Save to Supabase
    const orders = cartItems.map((item) => ({
      order_id: pendingOrderId,
      drink_id: item.id,
      drink_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_amount: item.subtotal,
      status: 'paid',
      created_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase.from('orders').insert(orders);

      if (error) {
        throw error;
      }

      setStatus({
        type: 'success',
        message: '✅ Payment confirmed! Order saved!',
      });

      setTimeout(() => {
        setCart({});
        setScreen('menu');
        setCodeInput('');
        setPendingOrderId(null);
      }, 2000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: `❌ Error: ${error.message}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-400 to-orange-500 p-4 sm:p-6 font-baloo">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-5xl sm:text-6xl mb-4 animate-spin-slow">☀️</div>
          <h1 className="text-5xl sm:text-6xl font-black text-pink-600 leading-tight mb-2 drop-shadow-lg">
            SUMMER
            <br />
            SIPSTERS
          </h1>
          <p className="text-base sm:text-lg font-bold text-teal-700 tracking-widest">
            ❤️ SIP. SMILE. REPEAT.
          </p>
        </div>

        {/* Status Messages */}
        {status && (
          <div
            className={`mb-6 p-4 rounded-xl font-bold animate-slide-up ${
              status.type === 'error'
                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                : 'bg-green-100 text-green-700 border-2 border-green-500'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* MENU SCREEN */}
        {screen === 'menu' && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
              {DRINKS.map((drink) => (
                <button
                  key={drink.id}
                  onClick={() => handleAddToCart(drink)}
                  className={`p-5 sm:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-lg animate-pop-in relative ${
                    cart[drink.id]
                      ? 'bg-gradient-to-br from-pink-100 to-yellow-50 border-4 border-pink-500 scale-105 shadow-2xl'
                      : 'bg-white border-4 border-transparent hover:border-pink-300'
                  }`}
                  style={{
                    animationDelay: `${DRINKS.indexOf(drink) * 0.1}s`,
                  }}
                >
                  {cart[drink.id] && (
                    <div className="absolute -top-3 -right-3 bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-lg">
                      {cart[drink.id]}
                    </div>
                  )}

                  <div className="text-5xl sm:text-6xl mb-3 block">{drink.emoji}</div>
                  <div className="font-black text-pink-600 text-lg sm:text-xl leading-tight mb-1">
                    {drink.name}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-teal-600 mb-2">
                    ₹{drink.price}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 italic">
                    {drink.tagline}
                  </div>
                </button>
              ))}
            </div>

            {/* Cart Section */}
            {Object.keys(cart).length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 border-4 border-yellow-400 shadow-lg animate-slide-up">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-pink-600">🛒 Your Cart</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm font-bold text-red-600 hover:text-red-800 underline"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center pb-3 border-b border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.emoji}</span>
                        <div>
                          <div className="font-bold text-pink-600">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            ₹{item.price} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-teal-600">₹{item.subtotal}</div>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 font-bold"
                        >
                          −
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-4 border-dashed border-pink-500 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-lg text-teal-700">TOTAL</span>
                    <span className="text-3xl sm:text-4xl font-black text-red-500">
                      ₹{total}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleShowQR}
                  className="w-full py-4 bg-gradient-to-br from-pink-500 to-red-500 text-white font-black text-lg rounded-2xl hover:shadow-2xl"
                >
                  💳 SHOW QR - ₹{total}
                </button>
              </div>
            )}
          </>
        )}

        {/* QR SCREEN */}
        {screen === 'qr' && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-black text-pink-600 text-center mb-6">
              💳 SCAN & PAY
            </h2>

            <div className="bg-gray-100 p-6 rounded-2xl mb-6 flex justify-center">
              <img src="/qr.jpg" alt="QR Code" className="w-64 h-64 object-contain" />
            </div>

            <div className="text-center mb-6">
              <p className="text-xl font-black text-teal-700 mb-2">Amount: ₹{total}</p>
              <p className="text-sm text-gray-600">
                Scan the QR code above with any UPI app to pay
              </p>
            </div>

            <div className="border-t-4 border-pink-500 pt-6">
              <label className="block text-sm font-black text-teal-700 mb-3">
                🔐 ENTER PAYMENT CODE:
              </label>
              <input
                type="password"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Enter code"
                className="w-full px-4 py-3 border-2 border-pink-500 rounded-lg text-center text-2xl font-black tracking-widest mb-4 focus:outline-none focus:border-pink-600"
              />
              <button
                onClick={handleVerifyCode}
                className="w-full py-4 bg-gradient-to-br from-green-500 to-green-600 text-white font-black text-lg rounded-2xl hover:shadow-2xl mb-3"
              >
                ✅ PAYMENT DONE
              </button>
              <button
                onClick={() => setScreen('menu')}
                className="w-full py-3 bg-gray-400 text-white font-black rounded-2xl hover:bg-gray-500"
              >
                ← Back to Menu
              </button>
            </div>
          </div>
        )}

        {/* Info Text */}
        <p className="text-center text-sm sm:text-base font-bold text-teal-700 opacity-80 mt-8">
          ✅ Secure UPI Payment • 📍 Order Tracked
        </p>
      </div>
    </div>
  );
}