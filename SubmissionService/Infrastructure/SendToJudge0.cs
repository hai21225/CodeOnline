using SubmissionService.Application.DTOs;
using SubmissionService.Application.Interface;
using System.Text.Json;
using System.Text;

namespace SubmissionService.Infrastructure
{
    public class SendToJudge0 : ISendToJudge0
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        public SendToJudge0(HttpClient httpClient,IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;

        }

        public async Task<ResultDTO?> RunCode(string sourceCode, int languageId, string stdin, string urlJudge0)
        {
            if (string.IsNullOrEmpty(sourceCode) || languageId<0)
                return null;

            string MapLanguage(int id)
            {
                return id switch
                {
                    71 => "python",
                    54 => "gpp",
                    62 => "java",
                    50=>"gcc",
                    51=>"mono",
                    73=>"rust",
                    _=> "python"
                };
            }
            var body = new
            {
                language= MapLanguage(languageId),
                version = "*",
                files = new[]
                {
                    new {content=sourceCode }
                },
                stdin= stdin
            };
            var content = new StringContent(
                    JsonSerializer.Serialize(body),
                    Encoding.UTF8,
                    "application/json");

            var pistonUrl = _configuration["Services:PistonUrl"];
            var response = await _httpClient.PostAsync($"{pistonUrl}/api/v2/execute", content);
            if (!response.IsSuccessStatusCode) return null;

            var result = await response.Content.ReadAsStringAsync();
            Console.WriteLine("Piston raw response: " + result);

            try
            {
                var json = JsonDocument.Parse(result);
                var run = json.RootElement.GetProperty("run");

                string stdout = run.GetProperty("stdout").GetString() ?? "";
                string stderr = run.GetProperty("stderr").GetString() ?? "";

                int code = run.GetProperty("code").GetInt32();

                return new ResultDTO
                {
                    Output = stdout,
                    Status = code == 0 ? "Accepted" : "Error",
                    ExecutionTime = 0, // piston không trả time mặc định
                    MemoryUsed = 0,    // piston cũng không trả memory
                    ErrorMessage = stderr
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Parse lỗi: " + ex.Message);
                return null;
            }

        }


    }
}
