using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TestProject.Models
{
    public class DirectoryContents
    {
        public string FullPath { get; set; }

        public long FileSizeInBytes
        {
            get { return Files.Sum(file => file.SizeInBytes); }
        }

        public IList<DirectoryModel> Directories { get; private set; }
        public IList<FileModel> Files { get; private set; }

        public DirectoryContents()
        {
            Directories = new List<DirectoryModel>();
            Files = new List<FileModel>();
        }

        public DirectoryContents(string fullPath, List<DirectoryModel> directories, List<FileModel> files)
        {
            this.FullPath = fullPath;
            this.Directories = directories;
            this.Files = files;
        }

        public void AddDirectory(DirectoryModel directory)
        {
            if (directory != null)
            {
                Directories.Add(directory);
            }
        }

        public void AddFile(FileModel file)
        {
            if (file != null)
            {
                Files.Add(file);
            }
        }
    }
}