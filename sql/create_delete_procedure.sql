-- Safe way to create/recreate the sp_DeleteSalesMaster procedure
-- Drop the procedure if it exists
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DeleteSalesMaster]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DeleteSalesMaster]
GO

-- Create the delete procedure
CREATE PROCEDURE sp_DeleteSalesMaster
    @SaleId INT
AS
BEGIN
    SET NOCOUNT ON;
    
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
            RAISERROR('Sale with ID %d does not exist.', 16, 1, @SaleId);
            RETURN;
        END
        
        -- Start transaction only after validation
        BEGIN TRANSACTION;
        
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
        -- Only rollback if there's an active transaction
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- Test the procedure - first check what sales exist
SELECT TOP 5 SaleId, SalespersonId, Total, SaleDate 
FROM SalesMasters 
ORDER BY SaleId;

-- Test with a non-existent ID (should fail gracefully)
EXEC sp_DeleteSalesMaster @SaleId = 999;

-- To test deletion, uncomment and use an actual SaleId from the query above:
-- EXEC sp_DeleteSalesMaster @SaleId = 1;
