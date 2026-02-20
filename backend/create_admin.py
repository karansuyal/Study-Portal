from app import app, db, User
from werkzeug.security import generate_password_hash

def create_admin(name, email, password):
    with app.app_context():
        # Check if exists
        existing = User.query.filter_by(email=email).first()
        if existing:
            print(f"❌ User with email {email} already exists!")
            return False
        
        # Create new admin
        new_admin = User(
            name=name,
            email=email,
            branch='Admin',
            semester=0,
            role='admin'
        )
        new_admin.set_password(password)
        db.session.add(new_admin)
        db.session.commit()
        print(f"✅ Admin created successfully!")
        print(f"   Name: {name}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        return True

if __name__ == "__main__":
    print("="*50)
    print("👑 CREATE NEW ADMIN")
    print("="*50)
    
    name = input("Enter admin name: ").strip()
    email = input("Enter admin email: ").strip()
    password = input("Enter admin password: ").strip()
    
    if name and email and password:
        create_admin(name, email, password)
    else:
        print("❌ All fields are required!")