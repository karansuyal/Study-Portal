"""
One-off script: applies migrations/002_add_premium_notes.sql to whatever
database DATABASE_URL points to.

HOW TO RUN THIS ON RENDER (no local psql needed):
  1. Render Dashboard -> your backend web service -> "Shell" tab (top right).
  2. In that shell, run:
       python run_migration.py
  3. You should see "Migration applied successfully." — that's it, done.

You can also run it locally if you have DATABASE_URL exported and network
access to the Render Postgres instance:
       DATABASE_URL="<your DATABASE_URL>" python run_migration.py

This is idempotent (uses IF NOT EXISTS everywhere) — safe to run more than
once if you're not sure whether it already applied.
"""

import os
import sys

import psycopg2

MIGRATION_FILE = os.path.join(os.path.dirname(__file__), 'migrations', '002_add_premium_notes.sql')


def main():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable is not set.")
        print("On Render Shell it should already be set automatically — if not, "
              "copy it from Dashboard -> your Postgres instance -> Connections.")
        sys.exit(1)

    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    if not os.path.exists(MIGRATION_FILE):
        print(f"ERROR: could not find {MIGRATION_FILE}")
        sys.exit(1)

    with open(MIGRATION_FILE) as f:
        sql = f.read()

    print(f"Connecting to database...")
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            print("Applying migrations/002_add_premium_notes.sql ...")
            cur.execute(sql)
        print("Migration applied successfully.")
        print("You can now redeploy/restart the backend if it isn't picking this up already.")
    finally:
        conn.close()


if __name__ == '__main__':
    main()