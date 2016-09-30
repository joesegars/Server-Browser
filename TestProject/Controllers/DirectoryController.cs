using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web.Http;
using TestProject.Models;

namespace TestProject.Controllers
{
    public class DirectoryController : ApiController
    {
        [HttpGet()]
        public IHttpActionResult GetDirectoryContents(string path)
        {
            if(String.IsNullOrWhiteSpace(path))
            {
                path = Directory.GetCurrentDirectory();
            }

            if (!Directory.Exists(path))
            {
                return Content(HttpStatusCode.NotFound, path + " does not exist.");
            }

            try
            {
                DirectoryInfo dirInfo = new DirectoryInfo(path);

                // get sub directories
                IEnumerable<DirectoryInfo> subDirectories = dirInfo.GetDirectories().Where(d => !d.Attributes.HasFlag(FileAttributes.Hidden));
                List<DirectoryModel> directoryModels = subDirectories.Select(item => new DirectoryModel
                {
                    Name = item.Name
                }).ToList();

                // get files
                IEnumerable<FileInfo> files = dirInfo.GetFiles().Where(f => !f.Attributes.HasFlag(FileAttributes.Hidden));
                List<FileModel> filesModels = files.Select(item => new FileModel
                {
                    Name = item.Name,
                    Extension = item.Extension,
                    SizeInBytes = item.Length
                }).ToList();

                DirectoryContents contents = new DirectoryContents(dirInfo.FullName, directoryModels, filesModels);
                return Ok(contents);
            }
            catch (UnauthorizedAccessException uae)
            {
                return Content(HttpStatusCode.InternalServerError, uae.Message);
            }
            catch(Exception e)
            {
                return Content(HttpStatusCode.InternalServerError, "Internal error: " + e.Message);
            }
        }

        [HttpPost()]
        public IHttpActionResult CreateDirectory(string path)
        {
            string directoryName = path.Substring(path.LastIndexOf('/') + 1);

            if (String.IsNullOrWhiteSpace(directoryName))
            {
                return BadRequest("Directory name cannot be empty.");
            }
            
            if (directoryName.Length > 256)
            {
                return BadRequest("Directory name cannot be greater than 256 characters");
            }

            if(directoryName.Contains(":"))
            {
                return BadRequest("Directory name cannot contain a colon (:)");
            }

            try
            {
                Regex badPathCharacters = new Regex("[" + Regex.Escape(new string(Path.GetInvalidPathChars())) + "]");
                if (badPathCharacters.IsMatch(directoryName))
                {
                    return BadRequest("Directory name has invalid characters: " + directoryName);
                };

                Directory.CreateDirectory(path);
                return Ok(true);
            }
            catch (Exception e)
            {
                return Content(HttpStatusCode.InternalServerError, "Internal error: " + e.Message);
            }
        }

        [HttpDelete()]
        public IHttpActionResult DeleteDirectory(string path)
        {
            if (String.IsNullOrWhiteSpace(path))
            {
                return BadRequest("Directory path cannot be empty.");
            }

            if(!Directory.Exists(path))
            {
                return Content(HttpStatusCode.NotFound, path + " does not exist.");
            }

            try
            {
                Directory.Delete(path, true);
                return Ok(true);
            }
            catch (Exception e)
            {
                return Content(HttpStatusCode.InternalServerError, "Internal error: " + e.Message);
            }
        }

        [HttpDelete()]
        public IHttpActionResult DeleteFile(string path)
        {
            if (String.IsNullOrEmpty(path))
            {
                return BadRequest("Must specify a file to delete.");
            }

            if (!File.Exists(path))
            {
                return Content(HttpStatusCode.NotFound, "File does not exist: " + path);
            }

            try
            {
                File.Delete(path);
                return Ok(true);
            }
            catch (Exception e)
            {
                return Content(HttpStatusCode.InternalServerError, "Internal error: " + e.Message);
            }
        }

        [HttpPost()]
        public HttpResponseMessage DownloadFile(string path)
        {
            if (String.IsNullOrEmpty(path))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            if (!File.Exists(path))
            {
                return Request.CreateResponse(HttpStatusCode.Gone);
            }

            try
            {
                HttpResponseMessage result = Request.CreateResponse(HttpStatusCode.OK);
                var stream = new FileStream(path, FileMode.Open);
                result.Content = new StreamContent(stream);
                result.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
                result.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
                result.Content.Headers.ContentDisposition.FileName = path.Substring(path.LastIndexOf('/') + 1);
                return result;
            }
            catch (Exception e)
            {
                HttpResponseMessage message = new HttpResponseMessage();
                message.Content = new StringContent("Internal server error: " + e.Message);
                message.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/html");
                message.StatusCode = HttpStatusCode.InternalServerError;
                return message;
            }
        }
    }
}
