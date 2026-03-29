# Sales Management System - Setup Guide

## Overview
This is a complete sales management interface with a Django backend and React frontend. The system includes:
- **Client Management**: Create, read, update, delete clients
- **Sales Orders/Invoices**: Manage sales transactions with line items
- **Sales Analytics**: View sales statistics and trends
- **PDF Generation**: Generate invoices (ready for extension)

## Backend Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create a virtual environment (optional but recommended)**
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```
If `requirements.txt` doesn't exist, install these packages:
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers drf-spectacular pillow python-decouple
```

4. **Apply migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create a superuser (admin account)**
```bash
python manage.py createsuperuser
```

6. **Run the development server**
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/api/`
Admin panel: `http://localhost:8000/admin/`
API Documentation: `http://localhost:8000/api/docs/`

## Frontend Setup

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Clients
- `GET /api/clients/` - List all clients
- `POST /api/clients/` - Create a new client
- `GET /api/clients/{id}/` - Get client details
- `PUT /api/clients/{id}/` - Update a client
- `DELETE /api/clients/{id}/` - Delete a client

### Sales (Ventes)
- `GET /api/ventes/` - List all sales
- `POST /api/ventes/` - Create a new sale
- `GET /api/ventes/{id}/` - Get sale details
- `PUT /api/ventes/{id}/` - Update a sale
- `DELETE /api/ventes/{id}/` - Delete a sale
- `GET /api/ventes/statistiques/?jours=30` - Get sales statistics
- `POST /api/ventes/{id}/valider/` - Validate a draft sale
- `POST /api/ventes/{id}/annuler/` - Cancel a sale

### Products
- `GET /api/products/` - List all products (from products app)

## Database Models

### Client
```
- nom (CharField): Client name
- type_client (ChoiceField): 'entreprise' or 'particulier'
- email (EmailField)
- telephone (CharField)
- adresse (TextField)
- code_postal (CharField)
- ville (CharField)
- contact_principal (CharField)
- notes (TextField)
- est_actif (BooleanField)
- created_at, updated_at (DateTime)
```

### Vente (Sale)
```
- numero (CharField): Unique invoice number (auto-generated)
- client (ForeignKey): Related client
- date_vente (DateField)
- statut (ChoiceField): brouillon, confirmée, annulée
- montant_total, montant_ht, montant_tva, montant_ttc (DecimalField)
- montant_remise (DecimalField): Discount amount
- taux_tva (DecimalField): VAT rate (default 20%)
- utilisateur (ForeignKey): User who created the sale
- notes (TextField)
- created_at, updated_at (DateTime)
```

### VenteItem (Sale Line Item)
```
- vente (ForeignKey): Related sale
- produit (ForeignKey): Related product
- quantite (PositiveIntegerField)
- prix_unitaire (DecimalField)
- montant_total (DecimalField): Auto-calculated
```

## Features

### Sales Dashboard
- Total sales count and amount for selected period
- Average sale amount
- Number of distinct clients
- Sales breakdown by status
- Top 10 clients by amount

### Sales Management
- Create, edit, delete sales
- Add/remove line items
- Automatic total calculation with VAT
- Apply discounts
- Filter by status and search by number/client name

### Client Management
- Create, edit, delete clients
- Search clients by name, email, or phone
- Classify as company (entreprise) or individual (particulier)

## Authentication

The system uses JWT (JSON Web Tokens) for authentication. 

1. Login endpoint: `POST /api/auth/login/`
   - Required fields: `username`, `password`
   - Returns: `access` and `refresh` tokens

2. Use the access token in the Authorization header:
   ```
   Authorization: Bearer <access_token>
   ```

3. Refresh token: `POST /api/auth/refresh/`
   - Send the refresh token to get a new access token

## Frontend Components

- **SalesManagement**: Main container component
- **SalesDashboard**: Statistics and overview
- **SalesList**: View and filter sales
- **SalesForm**: Create/edit sales with line items
- **ClientList**: Manage clients

## API Service

The `src/services/api.js` file provides all API calls:
- `clientService`: Client CRUD operations
- `venteService`: Sales CRUD operations and statistics
- `produitService`: Product listing

## Customization

### Adding New Fields
1. Update the model in `backend/sales/models.py`
2. Create and apply migrations: `python manage.py makemigrations && migrate`
3. Update serializers in `backend/sales/serializers.py`
4. Update frontend forms in `src/components/SalesForm.jsx`

### Adding Reports
Modify `src/components/SalesDashboard.jsx` to add custom reports and visualizations.

### PDF Generation
To add PDF export functionality:
1. Install: `pip install reportlab xhtml2pdf`
2. Create a views function for PDF generation
3. Add an export button in the frontend

## Troubleshooting

### CORS Errors
Make sure the React frontend URL is allowed in Django settings:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173'
]
```

### Database Issues
Reset the database:
```bash
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

### Port Conflicts
- Backend: Change port with `python manage.py runserver 8001`
- Frontend: Change port with `npm run dev -- --port 5174`

## Next Steps

1. **Add authentication UI**: Create login page in React
2. **Product images**: Implement product image upload and display
3. **PDF invoices**: Generate printable invoices
4. **Email integration**: Send invoices via email
5. **Inventory management**: Automatic stock updates on sale
6. **Payment tracking**: Add payment status and methods
7. **Advanced reports**: Sales by period, category, etc.
8. **Mobile app**: Build mobile version

## Support
For issues or questions, check the API documentation at `/api/docs/`
