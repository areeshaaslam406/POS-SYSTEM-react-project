-- First, let's check the actual table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'SalesMasters'
ORDER BY ORDINAL_POSITION;

-- Drop the existing procedure if it exists
IF EXISTS (SELECT * FROM sysobjects WHERE name='sp_DeleteSalesMaster' AND xtype='P')
    DROP PROCEDURE sp_DeleteSalesMaster;
GO

-- Create the corrected delete procedure
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
        
        -- Check if the sale exists and get information
        SELECT 
            @SalespersonId = SalespersonId,
            @Total = Total,
            @SaleDate = SaleDate
        FROM SalesMasters 
        WHERE SaleId = @SaleId;
        
        -- If no rows were returned, the sale doesn't exist
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

-- Test the procedure
EXEC sp_DeleteSalesMaster @SaleId = 999; -- This should fail gracefully
