using API.Extensions;
using API.Middleware;
using API.SignalR;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(opt =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
});
builder.Services.AddApplicationService(builder.Configuration);
builder.Services.AddIdentityService(builder.Configuration);

var app = builder.Build();
app.UseMiddleware<ExceptionMiddleware>();

app.UseXContentTypeOptions();
app.UseReferrerPolicy(opt => opt.NoReferrer());
app.UseXXssProtection(opt => opt.EnabledWithBlockMode());
app.UseXfo(opt => opt.Deny());
app.UseCsp(opt => opt
    .BlockAllMixedContent()
    .StyleSources(s =>
        s.Self().CustomSources("https://fonts.googleapis.com", "sha256-sZxz778M2iREo4Nh3EShjMAXSfzp6KIYk9PaSEU/YLc=",
            "sha256-jQFDEZeJDHp4BeY4xlNHzw9ZmJ2nmra4kTvVh9J+55A=",
            "sha256-VdJLYZrBOhBJj2L4/+iZupDWpR1sppzSbgJzXdO/Oss=",
            "sha256-DpOoqibK/BsYhobWHnU38Pyzt5SjDZuR/mFsAiVN7kk="))
    .FontSources(s => s.Self().CustomSources("https://fonts.gstatic.com", "data:"))
    .FormActions(s => s.Self())
    .FrameAncestors(s => s.Self())
    .ImageSources(s =>
        s.Self().CustomSources("blod:", "data:", "https://res.cloudinary.com", "https://platform-lookaside.fbsbx.com",
            "https://web.facebook.com"))
    .ScriptSources(s => s.Self().CustomSources("https://connect.facebook.net/"))
);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.Use(async (context, next) =>
    {
        context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000");
        await next.Invoke();
    });
}

app.UseCors("CorsPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.UseDefaultFiles();

app.UseStaticFiles();

app.MapControllers();

app.MapHub<ChatHub>("/chat");

app.MapFallbackToController("Index", "Fallback");

using var scope = app.Services.CreateScope();

var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<DataContext>();
    var userManage = services.GetRequiredService<UserManager<AppUser>>();
    context.Database.Migrate();
    await Seed.SeedData(context, userManage);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred while migrating the database");
}

app.Run();
