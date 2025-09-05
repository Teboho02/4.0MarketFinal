# Bazara Tech Market - React + Vite

A modern e-commerce platform built with React, Vite, and JavaScript for selling tech products.

## Features

- 🏠 **Home Page** with product categories and hero slider
- 🛍️ **Product Categories** (Laptops, Smartphones, Gaming, Accessories)
- 🛒 **Shopping Cart** with quantity management
- 💳 **Checkout System** with payment processing
- 🔐 **User Authentication** (Login/Signup)
- 👨‍💼 **Admin Panel** for product management
- 📱 **Responsive Design** for all devices
- 🎨 **Modern UI/UX** with smooth animations

## Tech Stack

- **Frontend**: React 18, Vite
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Styling**: CSS3 with custom utility classes

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   └── ProtectedRoute.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── CategoryPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── OrderConfirmation.jsx
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── SignupPage.jsx
│   └── admin/
│       └── AdminPanel.jsx
├── context/            # React Context providers
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── services/           # API services
│   ├── authService.js
│   └── productService.js
├── App.jsx            # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running at `https://fourbackend.onrender.com`

### Installation

1. **Clone and setup the project:**
```bash
# Create project directory
mkdir bazara-tech-market
cd bazara-tech-market

# Initialize npm and install dependencies
npm install
```

2. **Create the project files:**
   - Copy all the provided code files to their respective locations in the `src/` directory
   - Ensure the folder structure matches the layout above

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser and navigate to:**
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## API Integration

The app connects to a backend API for:
- User authentication (`/api/auth/`)
- Product management (`/api/products/`)
- File uploads (`/api/upload/`)

Base URL: `https://fourbackend.onrender.com`

## Key Features Implementation

### Authentication
- JWT token-based authentication
- Session storage for persistence
- Protected routes for admin access
- Login/signup forms with validation

### Shopping Cart
- Add/remove products
- Quantity management
- Persistent cart using localStorage
- Real-time cart total calculations

### Product Management
- Display products by category
- Search and filter functionality
- Admin CRUD operations
- Image upload support

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## Environment Setup

Make sure your backend API is running and accessible. The app expects these endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/products` - Get all products
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `POST /api/upload` - Upload images

## Demo Credentials

For testing admin functionality:
- Email: `admin@bazara.com`
- Password: `admin123`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Customization

### Adding New Product Categories
1. Update the category options in `CategoryPage.jsx`
2. Add new category routes in `App.jsx`
3. Update the navigation in `Header.jsx` and `Footer.jsx`

### Styling Modifications
- Global styles: `src/index.css`
- Component-specific styles: Use CSS classes within components
- Utility classes available for common styling needs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

---

Built with ❤️ using React and Vite