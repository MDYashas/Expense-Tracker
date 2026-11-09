# ExpenseTracker - Personal Finance Management

A full-stack expense tracking application built with Next.js 14+, PostgreSQL, Prisma, and NextAuth.

## 🚀 Features

### Core Features

- ✅ **User Authentication** - Secure login and registration with NextAuth
- ✅ **Receipt Scanner (NEW!)** - Upload receipts to auto-extract transaction details with OCR + AI
- ✅ **Dashboard** - Overview of total income, expenses, and balance with monthly charts
- ✅ **Transaction Management** - Add, view, filter, and delete income/expense transactions
- ✅ **Analytics** - Visual charts showing spending patterns by category and month
- ✅ **Profile Management** - Update user info and set monthly budgets
- ✅ **Settings** - Customize currency, theme (light/dark), and manage categories

### Pages

- `/` - Landing page with features and call-to-action
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard with stats and monthly chart
- `/add-transaction` - Add new income or expense with receipt scanner
- `/transactions` - View all transactions with filters
- `/analytics` - Charts by month and category
- `/profile` - User profile and budget settings
- `/settings` - App settings and custom categories

### Receipt Scanner Features

- 📸 **Image Upload** - Support for JPG, PNG (up to 10MB)
- 🔍 **Tesseract OCR** - Extracts text from receipt images
- 🤖 **AI Categorization** - OpenAI GPT-3.5 for smart category detection
- 💰 **Amount Detection** - Automatically finds total amount
- 🏪 **Merchant Detection** - Identifies business name
- 📝 **Auto-fill Form** - Extracted data populates transaction form

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (Neon DB compatible)
- **ORM**: Prisma
- **Authentication**: NextAuth / Auth.js
- **Styling**: Tailwind CSS + ShadCN UI
- **Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **OCR Backend**: Python + Flask + Tesseract + OpenAI

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd expense-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database (Neon DB or any PostgreSQL)
   DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # App
   NODE_ENV="development"
   ```

   Generate a secret for NextAuth:

   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**

   Generate Prisma Client:

   ```bash
   npm run prisma:generate
   ```

   Run migrations:

   ```bash
   npm run prisma:migrate
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📸 Receipt Scanner Setup (Optional)

The receipt scanner uses Python, Tesseract OCR, and OpenAI for intelligent transaction extraction.

### Quick Setup

**Windows:**

```bash
setup-ocr.bat
```

**macOS/Linux:**

```bash
chmod +x setup-ocr.sh
./setup-ocr.sh
```

### Manual Setup

1. **Install Tesseract OCR**

   - **Windows**: Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
   - **macOS**: `brew install tesseract`
   - **Linux**: `sudo apt-get install tesseract-ocr`

2. **Set up Python environment**

   ```bash
   cd python-ocr
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Configure environment**

   ```bash
   cd python-ocr
   cp .env.example .env
   # Edit .env and add OPENAI_API_KEY (optional)
   ```

4. **Start OCR service**

   ```bash
   cd python-ocr
   python app.py
   ```

   Service runs on `http://localhost:5000`

### Using Receipt Scanner

1. Go to `/add-transaction` page
2. Click "Receipt Scanner" card
3. Upload a receipt image (JPG/PNG)
4. Click "Scan Receipt"
5. Form auto-fills with extracted data
6. Review and submit transaction

**Note**: OCR works without OpenAI (using keyword matching), but AI categorization provides better accuracy.

## 🗄️ Database Setup (Neon DB)

1. Go to [Neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. Update your `.env` file with the connection string
5. Run migrations: `npm run prisma:migrate`

## 📱 Usage

1. **Register** - Create a new account at `/register`
2. **Login** - Sign in at `/login`
3. **Dashboard** - View your financial overview
4. **Add Transactions** - Record income and expenses
5. **View Transactions** - See all transactions with filtering
6. **Analytics** - Visualize spending patterns
7. **Profile** - Update personal info and monthly budget
8. **Settings** - Change currency, theme, and manage categories

## 🎨 Features in Detail

### Dashboard

- Total income, expenses, and balance cards
- Monthly income vs expenses chart
- Quick overview of financial health

### Transactions

- Add income or expense with category, amount, date, and description
- Filter by type (income/expense) and category
- Delete transactions
- View transaction history in a clean table

### Analytics

- Pie charts showing expenses and income by category
- Top spending categories
- Top income sources
- Visual insights into financial patterns

### Profile & Settings

- Update name, email, and profile picture
- Set monthly budget goals
- Choose currency (USD, EUR, GBP, JPY, INR, etc.)
- Toggle dark/light theme
- Create custom categories for better organization

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

Make sure to:

- Set all environment variables
- Run `prisma generate` before build
- Use a PostgreSQL database (Neon, Supabase, Railway, etc.)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🔒 Security

- Passwords are hashed with bcrypt
- JWT-based session management
- Protected routes with middleware
- Secure API endpoints with session validation

## 🎯 Future Enhancements

- Export transactions to CSV/PDF
- Recurring transactions
- Budget alerts and notifications
- Multiple accounts support
- Shared expenses with family/friends
- Mobile app (React Native)
- Bill reminders
- Receipt uploads

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

Built with ❤️ using Next.js and modern web technologies.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Happy Tracking! 💰**
