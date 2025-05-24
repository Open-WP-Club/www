# Open WP Club Website

A modern, responsive community website for WordPress open source enthusiasts. Built with HTML, TailwindCSS, and vanilla JavaScript.

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Open-WP-Club/www.git
   cd www
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the CSS**

   ```bash
   npm run build
   ```

4. **Start development server**

   ```bash
   npm run serve
   ```

The website will be available at `http://localhost:8000`

## 🛠️ Development

### Available Scripts

- **`npm run build`** - Build production CSS from Tailwind
- **`npm run watch`** - Watch for changes and rebuild CSS automatically
- **`npm run serve`** - Start a local development server on port 8000

### Development Workflow

1. **Start the development environment**

   ```bash
   npm run watch
   ```

   This will watch for changes in your source files and automatically rebuild the CSS.

2. **In a separate terminal, start the server**

   ```bash
   npm run serve
   ```

3. **Make your changes**
   - Edit HTML files directly in the root directory
   - Modify styles in `assets/css/styles.css` (imports TailwindCSS)
   - Update JavaScript in `assets/js/` directory

4. **View your changes**
   - Open `http://localhost:8000` in your browser
   - Changes to CSS will be reflected after the watch process rebuilds
   - JavaScript and HTML changes are immediate (just refresh the page)


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Support

- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our community at <https://discord.gg/ESTDmmjj>
- **GitHub Discussions**: For general questions and community chat