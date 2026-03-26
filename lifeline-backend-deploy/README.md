# LifeLine Node Backend

This backend is rebuilt to match the assignment stack:

- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication
- Password hashing with bcrypt
- Protected routes
- File upload with multer

## Features implemented

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- Hospital CRUD with admin protection and image upload
- Camp CRUD with admin protection
- Donor eligibility endpoints
- Appointment booking, listing, approval, and cancellation
- Admin user management
- Hospital request and emergency request flows
- Inventory and lab testing endpoints
- Recent activity feed and chatbot endpoint

## Setup

1. Install packages:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Update `MONGODB_URI` and `JWT_SECRET`.

Optional chatbot setup:

- `GROQ_API_KEY`
- `GROQ_MODEL` (default: `llama-3.1-8b-instant`)

4. Seed sample data:

```bash
npm run seed
```

5. Start server:

```bash
npm run dev
```

## Default seeded users

- Admin: `admin@lifeline.com` / `admin123`
- Donor: `john@example.com` / `pass123`

## Notes for deployment

- Use MongoDB Atlas for the hosted database
- Set `CLIENT_URL` to your deployed frontend URL
- Set `MONGODB_URI` and `JWT_SECRET` in the hosting platform environment variables
- Set `GROQ_API_KEY` if you want the chatbot to use Groq instead of the local fallback

## Recent Updates & Fixes (Latest Version)

### 🔧 Registration with Admin-Registered Hospitals Fixed

**Problem**: Users registering with an admin-registered hospital received a generic "Registration failed" error.

**Solution Implemented**:
- ✅ Added hospital validation in registration endpoint
- ✅ Validates that selected hospital exists in Hospital collection
- ✅ Checks exact match of hospital name, province, and district
- ✅ Returns clear error messages if hospital not found
- ✅ Improved frontend error display to show specific error reasons

**Changed Files**:
- `src/controllers/authController.js` - Added Hospital model validation
- `lifeline-frontend-deploy/src/pages/Register.jsx` - Better error messages

### ✅ Database Integrity Improvements

- All 8 MongoDB models validated for proper database usage
- Password security confirmed (bcryptjs hashing)
- Error handling standardized across all controllers
- Reference integrity checks added to registration flow

### 📋 Testing & Verification

Run database validation:
```bash
node src/scripts/validateDB.js
```

This verifies:
- ✓ MongoDB connection
- ✓ All model schemas validate correctly
- ✓ Collections exist in database
- ✓ Relationships are properly defined

### 📚 Documentation

See `DATABASE_VALIDATION_FIXES.md` for:
- Detailed explanation of fixes
- Database usage review for all models
- Recommendations for future improvements
- Migration path for schema enhancements

### 🚀 What's New

1. **Hospital Validation** - Registration now validates hospital exists
2. **Better Error Messages** - Users see why registration failed
3. **Database Tests** - Validation script to check DB health
4. **Comprehensive Docs** - Full documentation of changes and recommendations

### ✨ All Changes Are Backward Compatible

- No breaking changes
- Existing data remains intact
- Only adds new validation (prevents bad data from now on)

### 🔒 Security Notes

- Hospital validation prevents orphaned records
- Additional field validation improves data quality
- All changes follow existing security patterns (bcrypt, JWT, etc.)

## Quick Start for Updated Version

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET

# 3. Test database
npm run node src/scripts/validateDB.js

# 4. Seed data
npm run seed

# 5. Start development server
npm run dev
```

## Support & Questions

For issues with:
- **Registration**: Check `src/controllers/authController.js`
- **Hospital data**: Check `src/models/Hospital.js`
- **Donor profiles**: Check `src/models/Donor.js`
- **Database issues**: Run `node src/scripts/validateDB.js`
