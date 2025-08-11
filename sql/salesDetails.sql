-- this is the invoice view 
CREATE TABLE SalesDetails (
    SalesDetailId INT PRIMARY KEY IDENTITY(1,1),
    SaleId INT NOT NULL,
    ProductId INT NOT NULL,
    RetailPrice DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL,
    Discount DECIMAL(18,2) DEFAULT 0,

    FOREIGN KEY (SaleId) REFERENCES SalesMasters(SaleId),
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);
select * from SalesDetails;



