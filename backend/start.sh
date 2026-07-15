#!/bin/bash
set -e
echo "=== Initialising database ==="
python -m neverexpire.db.init_db
echo "=== Seeding reference data ==="
python -m neverexpire.db.seed
echo "=== Seeding demo data ==="
python -m neverexpire.db.seed_demo
echo "=== Seeding rich demo data (Al Rashid + Khan families) ==="
python seed_rich_demo.py || echo "Rich demo seed skipped (already seeded, or error) - continuing boot"
echo "=== Starting gunicorn ==="
exec gunicorn -w 2 -b 0.0.0.0:$PORT "neverexpire.web:create_app()"
