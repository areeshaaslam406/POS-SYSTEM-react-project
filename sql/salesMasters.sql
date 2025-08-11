-- named as sale.cs and salesContoller.cs is controller of it
CREATE TABLE SalesMasters (
    SaleId INT PRIMARY KEY IDENTITY(1,1),
    Total DECIMAL(18, 2) NOT NULL,
    SaleDate DATETIME NOT NULL DEFAULT GETDATE(),
    SalespersonId INT NOT NULL,
    Comments NVARCHAR(MAX) NULL,
    UpdatedTime DATETIME NULL,

    CONSTRAINT FK_SalesMasters_Salespersons FOREIGN KEY (SalespersonId)
        REFERENCES Salespersons(SalespersonID)
        ON DELETE CASCADE
);

INSERT INTO SalesMasters (Total, SaleDate, SalespersonId, Comments)
VALUES 
(5000.00, '2025-07-01 10:30:00', 1, 'First sale of the month'),
(3200.50, '2025-07-02 14:15:00', 2, 'Customer paid by card'),
(2750.75, '2025-07-03 11:45:00', 1, 'Repeat customer'),
(8900.00, '2025-07-04 16:00:00', 3, 'Large wholesale order'),
(1500.00, '2025-07-05 12:20:00', 2, 'Walk-in customer'),
(6200.00, '2025-07-06 13:00:00', 1, 'Cash payment'),
(4300.25, '2025-07-07 09:30:00', 3, 'Returned item adjusted');

--STORED PROCEDURES


exec sp_GetAllSalesMasters
-- get all sales record the page of all sales record
CREATE PROCEDURE sp_GetAllSalesMasters
AS
BEGIN
    SELECT * FROM SalesMasters;
END

-- altering the sp of getall masters while integrating with frontend
ALTER PROCEDURE sp_GetAllSalesMasters
AS
BEGIN
    SELECT 
        sm.SaleId,
        sm.SaleDate AS AddedTime,
        sm.UpdatedTime,
        sm.SalespersonId,
        s.Name AS Salesperson,
        COUNT(sd.SalesDetailId) AS Items,
        sm.Total AS TotalAmount,  -- Use saved total instead of recalculating
        sm.Comments
    FROM SalesMasters sm
    INNER JOIN Salespersons s ON sm.SalespersonId = s.SalespersonID
    LEFT JOIN SalesDetails sd ON sm.SaleId = sd.SaleId
    GROUP BY 
        sm.SaleId, sm.SaleDate, sm.UpdatedTime, sm.SalespersonId, s.Name, sm.Comments, sm.Total
    ORDER BY sm.SaleId ASC;
END

exec sp_GetAllSalesMasters;

-- THIS IS BASICALLY THE INVOICE VIEW
CREATE PROCEDURE sp_GetSalesMasterById
    @SaleId INT
AS
BEGIN
    SELECT * FROM SalesMasters
    WHERE SaleId = @SaleId;
END






exec sp_GetSalesMasterById @SaleId=88;
exec sp_GetAllSalesMasters;

-- testing with the editing issue of frontend
ALTER PROCEDURE sp_GetSalesMasterById
    @SaleId INT
AS
BEGIN
    -- 1. Header Info (Sale) - ADD SalespersonId
    SELECT 
        sm.SaleId,
        sm.SaleDate AS SaleDate,
        sm.UpdatedTime,
        sm.SalespersonId,        -- ✅ ADD THIS LINE - Critical for editing
        sp.Name AS Salesperson,
        sm.Comments
    FROM SalesMasters sm
    INNER JOIN Salespersons sp ON sm.SalespersonId = sp.SalespersonID
    WHERE sm.SaleId = @SaleId;

    -- 2. Sale Items (include product code for editing)
    SELECT 
        sd.SalesDetailId,
        sd.ProductId,
        p.Name AS ProductName,
        p.Code AS ProductBarcode,  -- Fixed: Use Code instead of Barcode
        sd.Quantity,
        sd.RetailPrice,
        (sd.RetailPrice * sd.Quantity) AS LineTotal,
        sd.Discount
    FROM SalesDetails sd
    INNER JOIN Products p ON sd.ProductId = p.ProductId
    WHERE sd.SaleId = @SaleId;

    -- 3. Totals (no changes needed)
    SELECT
        sm.Total AS Total
    FROM SalesMasters sm
    WHERE sm.SaleId = @SaleId;
END;



-- sp updated while integration with frontend
ALTER PROCEDURE sp_AddSalesMaster
    @SalespersonId INT,
    @Total DECIMAL(18,2), -- Pre-calculated total from frontend
    @Comments NVARCHAR(MAX) = NULL,
    @SalesItems NVARCHAR(MAX) = NULL  -- Format: "ProductId:RetailPrice:Quantity:DiscountAmount|..."
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Validate Salesperson exists
        DECLARE @SalespersonName NVARCHAR(100);
        DECLARE @SalespersonCode NVARCHAR(20);
        
        SELECT @SalespersonName = sp.Name, @SalespersonCode = sp.Code
        FROM Salespersons sp
        WHERE sp.SalespersonID = @SalespersonId;
        
        IF @SalespersonName IS NULL
        BEGIN
            RAISERROR('Salesperson with ID %d does not exist.', 16, 1, @SalespersonId);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Insert new SalesMaster record with frontend-calculated total
        DECLARE @NewSaleId INT;
        
        INSERT INTO SalesMasters (Total, SaleDate, SalespersonId, Comments)
        VALUES (@Total, GETDATE(), @SalespersonId, @Comments);
        
        SET @NewSaleId = SCOPE_IDENTITY();
        
        -- Process sales items if provided
        IF @SalesItems IS NOT NULL AND @SalesItems != ''
        BEGIN
            DECLARE @Item NVARCHAR(200);
            DECLARE @ProductId INT;
            DECLARE @RetailPrice DECIMAL(18,2);
            DECLARE @Quantity INT;
            DECLARE @DiscountAmount DECIMAL(18,2); -- Store actual discount amount
            DECLARE @Pos INT;
            
            -- Split items by | delimiter
            WHILE LEN(@SalesItems) > 0
            BEGIN
                SET @Pos = CHARINDEX('|', @SalesItems);
                IF @Pos = 0
                BEGIN
                    SET @Item = @SalesItems;
                    SET @SalesItems = '';
                END
                ELSE
                BEGIN
                    SET @Item = LEFT(@SalesItems, @Pos - 1);
                    SET @SalesItems = SUBSTRING(@SalesItems, @Pos + 1, LEN(@SalesItems));
                END
                
                -- Parse individual item (ProductId:RetailPrice:Quantity:DiscountAmount)
                IF LEN(@Item) > 0
                BEGIN
                    DECLARE @ItemParts TABLE (PartNum INT IDENTITY, PartValue NVARCHAR(50));
                    DECLARE @ItemTemp NVARCHAR(200) = @Item;
                    DECLARE @ColonPos INT;
                    
                    DELETE FROM @ItemParts;
                    
                    -- Split by colon delimiter
                    WHILE LEN(@ItemTemp) > 0
                    BEGIN
                        SET @ColonPos = CHARINDEX(':', @ItemTemp);
                        IF @ColonPos = 0
                        BEGIN
                            INSERT INTO @ItemParts (PartValue) VALUES (@ItemTemp);
                            SET @ItemTemp = '';
                        END
                        ELSE
                        BEGIN
                            INSERT INTO @ItemParts (PartValue) VALUES (LEFT(@ItemTemp, @ColonPos - 1));
                            SET @ItemTemp = SUBSTRING(@ItemTemp, @ColonPos + 1, LEN(@ItemTemp));
                        END
                    END
                    
                    -- Extract values (ProductId:RetailPrice:Quantity:DiscountAmount)
                    SELECT @ProductId = CAST(PartValue AS INT) FROM @ItemParts WHERE PartNum = 1;
                    SELECT @RetailPrice = CAST(PartValue AS DECIMAL(18,2)) FROM @ItemParts WHERE PartNum = 2;
                    SELECT @Quantity = CAST(PartValue AS INT) FROM @ItemParts WHERE PartNum = 3;
                    SELECT @DiscountAmount = CAST(ISNULL(PartValue, '0') AS DECIMAL(18,2)) FROM @ItemParts WHERE PartNum = 4;
                    
                    -- Validate Product exists
                    IF EXISTS (SELECT 1 FROM Products WHERE ProductId = @ProductId)
                    BEGIN
                        -- Insert sales detail with frontend-provided values
                        INSERT INTO SalesDetails (SaleId, ProductId, RetailPrice, Quantity, Discount)
                        VALUES (@NewSaleId, @ProductId, @RetailPrice, @Quantity, @DiscountAmount);
                    END
                    ELSE
                    BEGIN
                        RAISERROR('Product with ID %d does not exist.', 16, 1, @ProductId);
                        ROLLBACK TRANSACTION;
                        RETURN;
                    END
                END
            END
        END
        
        -- Return complete sale information
        SELECT 
            sm.SaleId,
            sm.Total,
            sm.SaleDate,
            sp.Name AS SalespersonName,
            sp.Code AS SalespersonCode,
            sm.Comments,
            @NewSaleId AS NewSaleId,
            COUNT(sd.SalesDetailId) AS TotalItems
        FROM SalesMasters sm
        INNER JOIN Salespersons sp ON sm.SalespersonId = sp.SalespersonID
        LEFT JOIN SalesDetails sd ON sm.SaleId = sd.SaleId
        WHERE sm.SaleId = @NewSaleId
        GROUP BY sm.SaleId, sm.Total, sm.SaleDate, sp.Name, sp.Code, sm.Comments;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

exec sp_GetAllSalesMasters
-- for only test purpose with issue of repitative products
ALTER PROCEDURE sp_AddSalesMaster
    @SalespersonId INT,
    @Total DECIMAL(18,2),
    @Comments NVARCHAR(MAX) = NULL,
    @SalesItems NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Validate Salesperson exists
        DECLARE @SalespersonName NVARCHAR(100);
        DECLARE @SalespersonCode NVARCHAR(20);
        
        SELECT @SalespersonName = sp.Name, @SalespersonCode = sp.Code
        FROM Salespersons sp
        WHERE sp.SalespersonID = @SalespersonId;
        
        IF @SalespersonName IS NULL
        BEGIN
            RAISERROR('Salesperson with ID %d does not exist.', 16, 1, @SalespersonId);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Insert new SalesMaster record
        DECLARE @NewSaleId INT;
        
        INSERT INTO SalesMasters (Total, SaleDate, SalespersonId, Comments)
        VALUES (@Total, GETDATE(), @SalespersonId, @Comments);
        
        SET @NewSaleId = SCOPE_IDENTITY();
        
        -- Process sales items if provided
        IF @SalesItems IS NOT NULL AND @SalesItems != ''
        BEGIN
            -- Declare ALL variables OUTSIDE the loop
            DECLARE @Item NVARCHAR(200);
            DECLARE @Pos INT;
            DECLARE @ItemTemp NVARCHAR(200);
            DECLARE @ColonPos INT;
            DECLARE @ProductId INT;
            DECLARE @RetailPrice DECIMAL(18,2);
            DECLARE @Quantity INT;
            DECLARE @DiscountAmount DECIMAL(18,2);
            
            -- Split items by | delimiter
            WHILE LEN(@SalesItems) > 0
            BEGIN
                SET @Pos = CHARINDEX('|', @SalesItems);
                IF @Pos = 0
                BEGIN
                    SET @Item = @SalesItems;
                    SET @SalesItems = '';
                END
                ELSE
                BEGIN
                    SET @Item = LEFT(@SalesItems, @Pos - 1);
                    SET @SalesItems = SUBSTRING(@SalesItems, @Pos + 1, LEN(@SalesItems));
                END
                
                -- Parse individual item (format: ProductId:RetailPrice:Quantity:DiscountAmount)
                IF LEN(@Item) > 0
                BEGIN
                    -- Reset variables for each item
                    SET @ProductId = NULL;
                    SET @RetailPrice = NULL;
                    SET @Quantity = NULL;
                    SET @DiscountAmount = NULL;
                    
                    -- Parse ProductId (first part)
                    SET @ColonPos = CHARINDEX(':', @Item);
                    IF @ColonPos > 0
                    BEGIN
                        SET @ProductId = CAST(LEFT(@Item, @ColonPos - 1) AS INT);
                        SET @ItemTemp = SUBSTRING(@Item, @ColonPos + 1, LEN(@Item));
                        
                        -- Parse RetailPrice (second part)
                        SET @ColonPos = CHARINDEX(':', @ItemTemp);
                        IF @ColonPos > 0
                        BEGIN
                            SET @RetailPrice = CAST(LEFT(@ItemTemp, @ColonPos - 1) AS DECIMAL(18,2));
                            SET @ItemTemp = SUBSTRING(@ItemTemp, @ColonPos + 1, LEN(@ItemTemp));
                            
                            -- Parse Quantity (third part)
                            SET @ColonPos = CHARINDEX(':', @ItemTemp);
                            IF @ColonPos > 0
                            BEGIN
                                SET @Quantity = CAST(LEFT(@ItemTemp, @ColonPos - 1) AS INT);
                                -- DiscountAmount is the remaining part
                                SET @DiscountAmount = CAST(SUBSTRING(@ItemTemp, @ColonPos + 1, LEN(@ItemTemp)) AS DECIMAL(18,2));
                            END
                            ELSE
                            BEGIN
                                -- No discount amount, quantity is the rest
                                SET @Quantity = CAST(@ItemTemp AS INT);
                                SET @DiscountAmount = 0;
                            END
                        END
                    END
                    
                    -- Validate that we got valid values
                    IF @ProductId IS NULL OR @RetailPrice IS NULL OR @Quantity IS NULL
                    BEGIN
                        DECLARE @DebugMsg NVARCHAR(500) = 'Failed to parse item: ' + @Item + '. ProductId=' + ISNULL(CAST(@ProductId AS NVARCHAR(10)), 'NULL') + ', RetailPrice=' + ISNULL(CAST(@RetailPrice AS NVARCHAR(10)), 'NULL') + ', Quantity=' + ISNULL(CAST(@Quantity AS NVARCHAR(10)), 'NULL');
                        RAISERROR(@DebugMsg, 16, 1);
                        ROLLBACK TRANSACTION;
                        RETURN;
                    END
                    
                    -- Validate Product exists
                    IF EXISTS (SELECT 1 FROM Products WHERE ProductId = @ProductId)
                    BEGIN
                        INSERT INTO SalesDetails (SaleId, ProductId, RetailPrice, Quantity, Discount)
                        VALUES (@NewSaleId, @ProductId, @RetailPrice, @Quantity, ISNULL(@DiscountAmount, 0));
                    END
                    ELSE
                    BEGIN
                        RAISERROR('Product with ID %d does not exist.', 16, 1, @ProductId);
                        ROLLBACK TRANSACTION;
                        RETURN;
                    END
                END
            END
        END
        
        -- Return complete sale information
        SELECT 
            sm.SaleId,
            sm.Total,
            sm.SaleDate,
            sp.Name AS SalespersonName,
            sp.Code AS SalespersonCode,
            sm.Comments,
            @NewSaleId AS NewSaleId,
            COUNT(sd.SalesDetailId) AS TotalItems
        FROM SalesMasters sm
        INNER JOIN Salespersons sp ON sm.SalespersonId = sp.SalespersonID
        LEFT JOIN SalesDetails sd ON sm.SaleId = sd.SaleId
        WHERE sm.SaleId = @NewSaleId
        GROUP BY sm.SaleId, sm.Total, sm.SaleDate, sp.Name, sp.Code, sm.Comments;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO




-- changes while with the edit issue now
ALTER PROCEDURE sp_UpdateSalesMaster
    @SaleId INT,
    @SalespersonId INT = NULL,
    @Total DECIMAL(18,2) = NULL, -- Pre-calculated total from frontend
    @Comments NVARCHAR(MAX) = NULL,
    @SalesItems NVARCHAR(MAX) = NULL  -- Format: "ProductId:RetailPrice:Quantity:DiscountAmount|..."
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Validate that the sale exists
        IF NOT EXISTS (SELECT 1 FROM SalesMasters WHERE SaleId = @SaleId)
        BEGIN
            RAISERROR('Sale with ID %d does not exist.', 16, 1, @SaleId);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validate Salesperson exists if provided
        IF @SalespersonId IS NOT NULL
        BEGIN
            DECLARE @SalespersonName NVARCHAR(100);
            
            SELECT @SalespersonName = sp.Name
            FROM Salespersons sp
            WHERE sp.SalespersonID = @SalespersonId;
            
            IF @SalespersonName IS NULL
            BEGIN
                RAISERROR('Salesperson with ID %d does not exist.', 16, 1, @SalespersonId);
                ROLLBACK TRANSACTION;
                RETURN;
            END
        END
        
        -- Delete existing sales details if new items are provided
        IF @SalesItems IS NOT NULL
        BEGIN
            DELETE FROM SalesDetails WHERE SaleId = @SaleId;
            
            -- Process new sales items if provided
            IF @SalesItems != ''
            BEGIN
                DECLARE @Item NVARCHAR(200);
                DECLARE @ProductId INT;
                DECLARE @RetailPrice DECIMAL(18,2);
                DECLARE @Quantity INT;
                DECLARE @DiscountAmount DECIMAL(18,2);
                DECLARE @Pos INT;
                
                -- Split items by | delimiter
                WHILE LEN(@SalesItems) > 0
                BEGIN
                    SET @Pos = CHARINDEX('|', @SalesItems);
                    IF @Pos = 0
                    BEGIN
                        SET @Item = @SalesItems;
                        SET @SalesItems = '';
                    END
                    ELSE
                    BEGIN
                        SET @Item = LEFT(@SalesItems, @Pos - 1);
                        SET @SalesItems = SUBSTRING(@SalesItems, @Pos + 1, LEN(@SalesItems));
                    END
                    
                    -- Parse individual item (ProductId:RetailPrice:Quantity:DiscountAmount)
                    IF LEN(@Item) > 0
                    BEGIN
                        -- Reset variables for each item to prevent contamination
                        SET @ProductId = NULL;
                        SET @RetailPrice = NULL;
                        SET @Quantity = NULL;
                        SET @DiscountAmount = NULL;
                        
                        -- Use simple string parsing instead of table variable
                        DECLARE @ItemTemp NVARCHAR(200) = @Item;
                        DECLARE @ColonPos INT;
                        DECLARE @Part1 NVARCHAR(50), @Part2 NVARCHAR(50), @Part3 NVARCHAR(50), @Part4 NVARCHAR(50);
                        
                        -- Parse ProductId (first part)
                        SET @ColonPos = CHARINDEX(':', @ItemTemp);
                        IF @ColonPos > 0
                        BEGIN
                            SET @Part1 = LEFT(@ItemTemp, @ColonPos - 1);
                            SET @ItemTemp = SUBSTRING(@ItemTemp, @ColonPos + 1, LEN(@ItemTemp));
                            
                            -- Parse RetailPrice (second part)
                            SET @ColonPos = CHARINDEX(':', @ItemTemp);
                            IF @ColonPos > 0
                            BEGIN
                                SET @Part2 = LEFT(@ItemTemp, @ColonPos - 1);
                                SET @ItemTemp = SUBSTRING(@ItemTemp, @ColonPos + 1, LEN(@ItemTemp));
                                
                                -- Parse Quantity (third part)
                                SET @ColonPos = CHARINDEX(':', @ItemTemp);
                                IF @ColonPos > 0
                                BEGIN
                                    SET @Part3 = LEFT(@ItemTemp, @ColonPos - 1);
                                    SET @Part4 = SUBSTRING(@ItemTemp, @ColonPos + 1, LEN(@ItemTemp)); -- Discount
                                END
                                ELSE
                                BEGIN
                                    SET @Part3 = @ItemTemp;
                                    SET @Part4 = '0'; -- Default discount
                                END
                            END
                        END
                        
                        -- Convert parts to proper types with validation
                        IF @Part1 IS NOT NULL AND @Part1 != ''
                            SET @ProductId = CAST(@Part1 AS INT);
                        IF @Part2 IS NOT NULL AND @Part2 != ''
                            SET @RetailPrice = CAST(@Part2 AS DECIMAL(18,2));
                        IF @Part3 IS NOT NULL AND @Part3 != ''
                            SET @Quantity = CAST(@Part3 AS INT);
                        IF @Part4 IS NOT NULL AND @Part4 != ''
                            SET @DiscountAmount = CAST(@Part4 AS DECIMAL(18,2));
                        ELSE
                            SET @DiscountAmount = 0;
                        
                        -- Validate that all required parts were parsed
                        IF @ProductId IS NULL OR @RetailPrice IS NULL OR @Quantity IS NULL
                        BEGIN
                            DECLARE @ParseError NVARCHAR(500) = 'Failed to parse item: ' + @Item + 
                                '. ProductId=' + ISNULL(CAST(@ProductId AS NVARCHAR(10)), 'NULL') + 
                                ', RetailPrice=' + ISNULL(CAST(@RetailPrice AS NVARCHAR(10)), 'NULL') + 
                                ', Quantity=' + ISNULL(CAST(@Quantity AS NVARCHAR(10)), 'NULL');
                            RAISERROR(@ParseError, 16, 1);
                            ROLLBACK TRANSACTION;
                            RETURN;
                        END
                        
                        -- DEBUG: Print parsed values
                        PRINT 'DEBUG SP: Raw Item = ' + @Item;
                        PRINT 'DEBUG SP: Parsed Item - ProductId=' + ISNULL(CAST(@ProductId AS NVARCHAR(10)), 'NULL') + 
                              ', Price=' + ISNULL(CAST(@RetailPrice AS NVARCHAR(20)), 'NULL') + 
                              ', Qty=' + ISNULL(CAST(@Quantity AS NVARCHAR(10)), 'NULL') + 
                              ', Discount=' + ISNULL(CAST(@DiscountAmount AS NVARCHAR(20)), 'NULL');
                        
                        -- Validate Product exists
                        IF EXISTS (SELECT 1 FROM Products WHERE ProductId = @ProductId)
                        BEGIN
                            -- Insert updated sales detail
                            INSERT INTO SalesDetails (SaleId, ProductId, RetailPrice, Quantity, Discount)
                            VALUES (@SaleId, @ProductId, @RetailPrice, @Quantity, @DiscountAmount);
                        END
                        ELSE
                        BEGIN
                            RAISERROR('Product with ID %d does not exist.', 16, 1, @ProductId);
                            ROLLBACK TRANSACTION;
                            RETURN;
                        END
                    END
                END
            END
        END
        
        -- Update SalesMaster record with frontend-calculated total
        UPDATE SalesMasters 
        SET 
            SalespersonId = ISNULL(@SalespersonId, SalespersonId),
            Comments = ISNULL(@Comments, Comments),
            Total = ISNULL(@Total, Total), -- Use frontend total if provided
            UpdatedTime = GETDATE()
        WHERE SaleId = @SaleId;
        
        -- Return updated sale information
        SELECT 
            sm.SaleId,
            sm.Total,
            sm.SaleDate,
            sm.UpdatedTime,
            sp.Name AS SalespersonName,
            sp.Code AS SalespersonCode,
            sm.Comments,
            COUNT(sd.SalesDetailId) AS TotalItems
        FROM SalesMasters sm
        INNER JOIN Salespersons sp ON sm.SalespersonId = sp.SalespersonID
        LEFT JOIN SalesDetails sd ON sm.SaleId = sd.SaleId
        WHERE sm.SaleId = @SaleId
        GROUP BY sm.SaleId, sm.Total, sm.SaleDate, sm.UpdatedTime, sp.Name, sp.Code, sm.Comments;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO



-- sp for delete salesmaster - CORRECTED VERSION
CREATE PROCEDURE sp_DeleteSalesMaster
    @SaleId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Declare variables for sale information
        DECLARE @SalespersonId INT;
        DECLARE @SalespersonName NVARCHAR(100);
        DECLARE @Total DECIMAL(18,2);
        DECLARE @SaleDate DATETIME;
        DECLARE @ItemCount INT = 0;
        
        -- Check if the sale exists and get information in one query
        SELECT 
            @SalespersonId = SalespersonId,
            @Total = Total,
            @SaleDate = SaleDate
        FROM SalesMasters 
        WHERE SaleId = @SaleId;
        
        -- If no rows were affected, the sale doesn't exist
        IF @@ROWCOUNT = 0
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Sale with ID %d does not exist.', 16, 1, @SaleId);
            RETURN;
        END
        
        -- Get salesperson name
        SELECT @SalespersonName = Name 
        FROM Salespersons 
        WHERE SalespersonID = @SalespersonId;
        
        -- Get item count from sales details
        SELECT @ItemCount = COUNT(*) 
        FROM SalesDetails 
        WHERE SaleId = @SaleId;
        
        -- Delete sales details first (foreign key constraint)
        DELETE FROM SalesDetails WHERE SaleId = @SaleId;
        
        -- Delete the sales master record
        DELETE FROM SalesMasters WHERE SaleId = @SaleId;
        
        -- Return information about the deleted sale
        SELECT 
            @SaleId AS DeletedSaleId,
            @SalespersonId AS SalespersonId,
            @SalespersonName AS SalespersonName,
            @Total AS DeletedTotal,
            @SaleDate AS DeletedSaleDate,
            @ItemCount AS DeletedItemCount,
            'Sale successfully deleted' AS Message;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO



-- edit record - SIMPLE VERSION (There's a comprehensive version above)
CREATE PROCEDURE sp_UpdateSalesMaster_Simple
    @SaleId INT,
    @Total DECIMAL(18, 2),
    @SalespersonId INT,
    @Comments NVARCHAR(MAX) = NULL
AS
BEGIN
    UPDATE SalesMasters
    SET 
        Total = @Total,
        SalespersonId = @SalespersonId,
        Comments = @Comments,
        UpdatedTime = GETDATE()
    WHERE SaleId = @SaleId;
END
GO
-- discarding a sale - USE THE COMPREHENSIVE VERSION ABOVE
-- CREATE PROCEDURE sp_DeleteSalesMaster
--     @SaleId INT
-- AS
-- BEGIN
--     DELETE FROM SalesMasters
--     WHERE SaleId = @SaleId;
-- END



EXEC sp_GetSalesMastersBySalespersonId @SalespersonId = 1;


EXEC sp_AddSalesMaster 
    @Total = 12000.50, 
    @SalespersonId = 1, 
    @Comments = N'First sale entry for testing';

EXEC sp_UpdateSalesMaster 
    @SaleId = 1,
    @Total = 13500.75, 
    @SalespersonId = 1, 
    @Comments = N'Updated sale amount';

EXEC sp_DeleteSalesMaster @SaleId = 78;

EXEC sp_GetSalesMasterById @SaleId = 77;

EXEC sp_GetAllSalesMasters;

EXEC sp_GetAllSalespersons;
EXEC sp_DeleteSalesperson @SalespersonID = 10;
EXEC sp_DeleteProduct @ProductId = 14;
exec sp_GetAllProducts;