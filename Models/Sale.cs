using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WebApplication2.Models
{
    public class SalesMaster
    {
        //public int SaleId { get; set; } // this is PK

        //[Required]
        //public decimal Total { get; set; }

        //public DateTime SaleDate { get; set; }

        //[Required]
        // Remove JsonIgnore to allow SalespersonId in API responses for detailed views
        public int SalespersonId { get; set; } // fk from  Salespersons table

        //public string? Comments { get; set; }
        //public DateTime? UpdatedTime { get; set; }

        public int SaleId { get; set; }
        public DateTime SaleDate { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string SalespersonName { get; set; } // New
        public int Items { get; set; }               // New
        public decimal Total { get; set; }
        public string Comments { get; set; }
        public List<SalesDetail> Details { get; set; } = new(); // Add this to SalesMaster

    }


    public class BillRequest
    {
        public int SalespersonId { get; set; }
        public decimal Total { get; set; } // Frontend calculated total
        public string Comments { get; set; }
        public List<SalesDetail> Items { get; set; } = new();
    }

    public class DeleteResult
    {
        public bool Success { get; set; }
        public int DeletedSaleId { get; set; }
        public int SalespersonId { get; set; }
        public string SalespersonName { get; set; }
        public decimal DeletedTotal { get; set; }
        public DateTime DeletedSaleDate { get; set; }
        public int DeletedItemCount { get; set; }
        public string Message { get; set; }
    }
}