CREATE TABLE Salespersons
(
    SalespersonID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Code NVARCHAR(20) NOT NULL UNIQUE,  -- Ensures uniqueness
    EnteredDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedTime DATETIME NULL
);


--STORED PROCEDURES

CREATE PROCEDURE sp_GetAllSalespersons
AS
BEGIN
    SELECT * FROM Salespersons;
END

CREATE PROCEDURE sp_GetSalespersonById
    @SalespersonID INT
AS
BEGIN
    SELECT * FROM Salespersons WHERE SalespersonID = @SalespersonID;
END

CREATE PROCEDURE sp_AddSalesperson
    @Name NVARCHAR(100),
    @Code NVARCHAR(20)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Salespersons WHERE Code = @Code)
    BEGIN
        RAISERROR('Salesperson with the same code already exists.', 16, 1);
        RETURN;
    END

    INSERT INTO Salespersons (Name, Code, EnteredDate)
    VALUES (@Name, @Code, GETDATE());
END


CREATE PROCEDURE sp_UpdateSalespersonName
    @SalespersonID INT,
    @Name NVARCHAR(100)
AS
BEGIN
    UPDATE Salespersons
    SET Name = @Name,
        UpdatedTime = GETDATE()
    WHERE SalespersonID = @SalespersonID;
END


CREATE PROCEDURE sp_DeleteSalesperson
    @SalespersonID INT
AS
BEGIN
    DELETE FROM Salespersons WHERE SalespersonID = @SalespersonID;
END

ALTER PROCEDURE sp_DeleteSalesperson
    @SalespersonID INT
AS
BEGIN
    -- Check if the salesperson exists in SalesMasters table
    IF EXISTS (SELECT 1 FROM SalesMasters WHERE SalespersonId = @SalespersonID)
    BEGIN
        RAISERROR('Cannot delete salesperson. This salesperson has made sales and cannot be removed.', 16, 1);
        RETURN;
    END

    -- Check if the salesperson exists in Salespersons table
    IF NOT EXISTS (SELECT 1 FROM Salespersons WHERE SalespersonID = @SalespersonID)
    BEGIN
        RAISERROR('Salesperson not found.', 16, 1);
        RETURN;
    END

    -- If no sales exist, proceed with deletion
    DELETE FROM Salespersons WHERE SalespersonID = @SalespersonID;
    
    -- Return success message
    SELECT 'Salesperson successfully deleted.' AS Message;
END
EXEC sp_GetAllSalespersons;



