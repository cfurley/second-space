#!/bin/bash

# Database Reset Script for Render.com
# This drops all tables and re-runs the initialization script

echo "🗄️  Database Reset Script"
echo "========================"
echo ""

# Check if DATABASE_URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Database URL required"
    echo ""
    echo "Usage: ./database/reset.sh 'postgresql://user:pass@host/db?ssl=true'"
    echo ""
    echo "Get your database URL from:"
    echo "  Render Dashboard → second-space-db → Connect → External Connection"
    echo ""
    exit 1
fi

DB_URL="$1"

echo "⚠️  WARNING: This will delete ALL data in your database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Reset cancelled"
    exit 0
fi

echo ""
echo "🗑️  Step 1/2: Dropping all tables..."
psql "$DB_URL" << EOF
-- Drop everything cleanly
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Restore default permissions
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO second_space_user;

-- Confirm it's empty
\dt
EOF

if [ $? -ne 0 ]; then
    echo "❌ Error dropping tables"
    exit 1
fi

echo ""
echo "🔄 Step 2/2: Reinitializing database from init.sql..."
psql "$DB_URL" -f "$(dirname "$0")/init/init.sql"

if [ $? -ne 0 ]; then
    echo "❌ Error running init script"
    exit 1
fi

echo ""
echo "✅ Database reset complete!"
echo ""
echo "📊 Quick verification:"
psql "$DB_URL" -c "\dt"
