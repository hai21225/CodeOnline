using Microsoft.EntityFrameworkCore;
using SubmissionService.Application.Interface;
using SubmissionService.Infrastructure;
using ShareLibrary;
using RabbitMQ.Client;
using SubmissionService.Infrastructure.Persistence;
using SubmissionService.Application.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SharedLibrary.Jwt;
using System.Text;
using SubmissionService.Domain;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();




builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient<SendToJudge0>();


builder.Services.AddScoped<ICompareTestCase, CompareTestCase>();
builder.Services.AddScoped<ISendToJudge0, SendToJudge0>();
builder.Services.AddScoped<IResultRepository, ResultRepository>();
builder.Services.AddScoped<ISubmissionRepository, SubmissionRepository>();
builder.Services.AddScoped<ILanguageRepository, LanguageRepository>();
builder.Services.AddScoped<LanguageManager>();
builder.Services.AddScoped<SubmissionManager>();
builder.Services.AddScoped<RunCodeHandle>();

builder.Services.AddScoped<ResultManager>(); // 

var rabbitHost = builder.Configuration["RabbitMQ:HostName"] ?? "localhost";

builder.Services.AddSingleton<IConnectionFactory>(sp =>
    new ConnectionFactory()
    {
        HostName = builder.Configuration["RabbitMQ:HostName"] ?? "localhost",
        UserName = builder.Configuration["RabbitMQ:UserName"] ?? "guest",
        Password = builder.Configuration["RabbitMQ:Password"] ?? "guest",
        Port = int.Parse(builder.Configuration["RabbitMQ:Port"] ?? "5672")
    });

builder.Services.AddSingleton<IEventBus, RabbitMQEventBus>();
builder.Services.AddHostedService<RabbitMqSubscriberService>();



// lay cau hinh jwt
builder.Services.Configure<JwtOptions>(
    builder.Configuration.GetSection("JwtOptions"));
// dang ki jwt
builder.Services.AddSingleton<IJwtService, JwtService>();
//cau hinh 
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtOptions = builder.Configuration.GetSection("JwtOptions").Get<JwtOptions>();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions!.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions?.SecretKey ?? ""))
        };
    });

builder.Services.AddAuthorization();




var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

//using (var scope = app.Services.CreateScope())
//{
//    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//    db.Database.Migrate(); // tự động tạo DB và apply migration khi app chạy


//    if (!db.Languages.Any())
//    {
//        db.Languages.AddRange(
//            new Language { LanguageId = 71, LanguageName = "Python (3.8.1)" },
//            new Language { LanguageId = 54, LanguageName = "C++ (GCC 9.2.0)" },
//            new Language { LanguageId = 73, LanguageName = "Rust (1.40.0)" },
//            new Language { LanguageId = 62, LanguageName = "Java (OpenJDK 13.0.1)" },
//            new Language { LanguageId = 51, LanguageName = "C# (Mono 6.6.0.161)" },
//            new Language { LanguageId = 50, LanguageName = "C (GCC 9.2.0)" }
//        );
//        db.SaveChanges();
//    }

//}


app.Run();
