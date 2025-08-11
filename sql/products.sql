CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    
    Code NVARCHAR(6) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    
    CostPrice DECIMAL(18, 2) NOT NULL CHECK (CostPrice >= 0),
    RetailPrice DECIMAL(18, 2) NOT NULL CHECK (RetailPrice >= 0),

    CreationDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedTime DATETIME NULL
);



SELECT*FROM Products

-- STORED PROCEDURES
CREATE PROCEDURE sp_GetAllProducts
AS
BEGIN
    SELECT * FROM Products;
END


CREATE PROCEDURE sp_GetProductsById
    @ProductId INT
AS
BEGIN
    SELECT * FROM Products WHERE ProductId = @ProductId;
END

CREATE PROCEDURE sp_AddProduct
    @Code NVARCHAR(6),
    @Name NVARCHAR(100),
    @CostPrice DECIMAL(18, 2),
    @RetailPrice DECIMAL(18, 2)
AS
BEGIN
    INSERT INTO Products (Code, Name, CostPrice, RetailPrice, CreationDate)
    VALUES (@Code, @Name, @CostPrice, @RetailPrice, GETDATE());
END

CREATE PROCEDURE sp_UpdateProduct
    @ProductId INT,
    @CostPrice DECIMAL(18, 2),
    @RetailPrice DECIMAL(18, 2)
AS
BEGIN
    UPDATE Products
    SET 
        CostPrice = @CostPrice,
        RetailPrice = @RetailPrice,
        UpdatedTime = GETDATE()
    WHERE ProductId = @ProductId;
END

ALTER PROCEDURE sp_UpdateProduct
    @ProductId INT,
    @CostPrice DECIMAL(18, 2),
    @RetailPrice DECIMAL(18, 2),
    @Name NVARCHAR(100) = NULL  -- Optional parameter for name
AS
BEGIN
    UPDATE Products
    SET 
        CostPrice = @CostPrice,
        RetailPrice = @RetailPrice,
        Name = ISNULL(@Name, Name),  -- Only update name if provided
        UpdatedTime = GETDATE()
    WHERE ProductId = @ProductId;
END



CREATE PROCEDURE sp_DeleteProduct
    @ProductId INT
AS
BEGIN
    DELETE FROM Products WHERE ProductId = @ProductId;
END

ALTER PROCEDURE sp_DeleteProduct
    @ProductId INT
AS
BEGIN
    -- Check if the product exists in SalesDetails table (has been sold)
    IF EXISTS (SELECT 1 FROM SalesDetails WHERE ProductId = @ProductId)
    BEGIN
        RAISERROR('Cannot delete product. This product has been sold and cannot be removed.', 16, 1);
        RETURN;
    END

    -- Check if the product exists in Products table
    IF NOT EXISTS (SELECT 1 FROM Products WHERE ProductId = @ProductId)
    BEGIN
        RAISERROR('Product not found.', 16, 1);
        RETURN;
    END

    -- If no sales exist, proceed with deletion
    DELETE FROM Products WHERE ProductId = @ProductId;
    
    -- Return success message
    SELECT 'Product successfully deleted.' AS Message;
END
EXEC sp_GetAllProducts;