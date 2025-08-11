04-API-Reference.md
markdown
Copy
Edit
# API Reference

## Base URL
`http://localhost:5000/api`

---

## Products

- **GET** `/products`  
  Get all products.

- **POST** `/products`  
  Create a new product.  
  **Request Body:**
  ```json
  {
    "name": "string",
    "price": number,
    "quantity": number
  }
PUT /products/{id}
Update product by ID.
Request Body: Same as POST.

DELETE /products/{id}
Delete product by ID.

Salespersons
GET /salespersons
Get all salespersons.

POST /salespersons
Create a new salesperson.
Request Body:

json

{
  "name": "string",
  "email": "string"
}
PUT /salespersons/{id}
Update salesperson by ID.
Request Body: Same as POST.

DELETE /salespersons/{id}
Delete salesperson by ID.

Sales Records
GET /salesrecords
Get all sales records.

POST /salesrecords
Create a new sales record.
Request Body:

json
Copy
Edit
{
  "saleDate": "YYYY-MM-DD",
  "salespersonId": number,
  "productDetails": [
    {
      "productId": number,
      "quantity": number
    }
  ]
}
PUT /salesrecords/{id}
Update sales record by ID.
Request Body: Same as POST.

DELETE /salesrecords/{id}
Delete sales record by ID.

