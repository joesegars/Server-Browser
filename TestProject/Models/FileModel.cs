using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TestProject.Models
{
    public class FileModel
    {
        public string Name { get; set; }
        public string Extension { get; set; }
        public long SizeInBytes { get; set; }
    }
}