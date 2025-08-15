
# Modern POS System - Advanced Point of Sale Management

![POS System Preview](POS(Main%20Page).PNG)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

A **web-based Point of Sale (POS) system** designed for retail businesses, featuring a **React frontend** and **.NET Core backend** for seamless inventory and sales management.

---

## 🚀 Features

- **🛍️ Product Management:** Add, edit, delete, and track inventory items.  
- **👔 Sales Team Management:** Manage salespersons and their transactions.  
- **💰 Sales Processing:** Record sales with multiple products and track totals.  
- **📊 Sales Analytics:** View historical sales data and reports.  
- **🖥️ Modern UI:** Responsive and user-friendly interface.  
- **🔄 Real-time Updates:** Inventory automatically updates with sales.

---

## 📸 Screenshots

| Dashboard View | Products Management | Salespersons Management | Sales Records |
|----------------|-------------------|------------------------|---------------|
| README.md/assets/POS(Main Page).PNG | README.md/assets/POS(Product Page).PNG | README.md/assets/POS( Salespersons Page).PNG | README.md/assets/POS( Record page).PNG |

---

## 🛠️ Technology Stack

**Frontend:**  
- React.js  
- Tailwind CSS  
- Axios for API requests  

**Backend:**  
- .NET Core Web API  
- ADO.NET / Entity Framework Core (depending on implementation)  
- SQL Server  

---

## ⚡ Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)  
- SQL Server 2019+  
- Node.js 18+ and npm  
- Git  

### Installation

1. **Clone the repository**

   git clone https://github.com/yourusername/pos-system.git
   cd pos-system


2. **Backend Setup**


   cd Backend
   dotnet restore
   dotnet build
 

   * Configure your `appsettings.json` with SQL Server connection string.
   * Apply database migrations:

     dotnet ef database update
    
   * Run the backend API:


     dotnet run
    

3. **Frontend Setup**


   cd Frontend
   npm install
   npm start
 

**Access the application:**

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:5000/api`



## 📡 API Endpoints

| Resource      | Endpoint             | Methods          |
| ------------- | -------------------- | ---------------- |
| Products      | `/products`          | GET, POST        |
| Product       | `/products/{id}`     | GET, PUT, DELETE |
| Salespersons  | `/salespersons`      | GET, POST        |
| Salesperson   | `/salespersons/{id}` | GET, PUT, DELETE |
| Sales Records | `/salesrecords`      | GET, POST        |
| Sales Record  | `/salesrecords/{id}` | GET, PUT, DELETE |

For complete API documentation, see [API-Reference.md](API-Reference.md).


## 📖 Usage Guide

### Adding Products

1. Go to **Products** page.
2. Click **"+ Add Product"**.
3. Fill in product details (name, price, quantity).
4. Click **Save**.

### Processing Sales

1. Select **Salesperson** from dropdown.
2. Search and add products to cart.
3. Review the order summary.
4. Click **"Complete Sale"**.

### Viewing Sales Records

1. Open **Sales Records** page.
2. Filter by date range if needed.
3. Export data as CSV or PDF.



## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch:

   git checkout -b feature/your-feature
 
3. Commit your changes:

  
   git commit -m "Add some feature"
 
4. Push to the branch:

  
   git push origin feature/your-feature  
5. Open a Pull Request.

See [Contributing.md](Contributing.md) for detailed guidelines.

## 📝 Changelog

### \[1.0.0] - 2025-08-11

* Initial release with full POS functionality.
* Product, salesperson, and sales record management.
* Basic reporting and analytics.

Full changelog: [Changelog.md](Changelog.md).

## ⚖️ License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.



## 💬 Support

For questions or issues, please open an issue in the [GitHub repository](https://github.com/yourusername/pos-system/issues).
sional and attractive on GitHub.  

Do you want me to do that?
```
