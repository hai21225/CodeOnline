using AssignmentService.Application.Interface;
using AssignmentService.Application.Service;
using AssignmentService.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RabbitMQ.Client;
using SharedLibrary.Jwt;
using ShareLibrary;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<AssignmentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AssignmentDb")));


builder.Services.AddHttpClient<TestCaseRepository>();

builder.Services.AddScoped<IAssignmentRepository, AssignmentRepository>();
builder.Services.AddScoped<ITestCaseRepository, TestCaseRepository>();
builder.Services.AddScoped<IResourceRepository, ResourceRepository>();
builder.Services.AddScoped<AssignmentManager>();
builder.Services.AddScoped<TestCaseManager>();
builder.Services.AddScoped<ResourceManager>();
builder.Services.AddScoped<TestCaseHandle>();


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
// dang ki rabbit mq
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions?.SecretKey??""))
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

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AssignmentDbContext>();
    db.Database.Migrate(); // 
}


app.Run();
