CREATE TABLE Cashiers (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    Name NVARCHAR(100) NOT NULL,                  -- Required name (length optional)
    EmployeeNumber NVARCHAR(20) NOT NULL UNIQUE,  -- Required, unique employee number
    AddedTime DATETIME NOT NULL DEFAULT GETDATE(),-- Set when created
    UpdatedTime DATETIME NULL                     -- Nullable for edits
);



-- stored procedures
-- get all cashiers
CREATE PROCEDURE sp_GetAllCashiers
AS
BEGIN
    SELECT * FROM Cashiers;
END
-- get cashier by id
CREATE PROCEDURE sp_GetCashierById
    @Id INT
AS
BEGIN
    SELECT * FROM Cashiers WHERE Id = @Id;
END
-- add cashier
CREATE PROCEDURE sp_AddCashier
    @Name NVARCHAR(100),
    @EmployeeNumber NVARCHAR(20)
AS
BEGIN
   

    INSERT INTO Cashiers (Name, EmployeeNumber, AddedTime)
    VALUES (@Name, @EmployeeNumber, GETDATE());
END
--update cashier
CREATE PROCEDURE sp_UpdateCashierName
    @Id INT,
    @Name NVARCHAR(100)
AS
BEGIN
    UPDATE Cashiers
    SET Name = @Name,
        UpdatedTime = GETDATE()
    WHERE Id = @Id;
END
-- delete cashier
CREATE PROCEDURE sp_DeleteCashier
    @Id INT
AS
BEGIN
    DELETE FROM Cashiers WHERE Id = @Id;
END

-- test run
EXEC sp_GetAllCashiers;
EXEC sp_AddCashier @Name = 'saba aftab', @EmployeeNumber = '1234567';
