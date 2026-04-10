using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserService.Application.DTO;
using UserService.Application.Interface;
using UserService.Domain;

namespace UserService.Infrastructure
{
    public class UserRepository : IUserRepository
    {
        private readonly UserAppDbContext _dbcontext;
        private readonly PasswordHasher<User> _passwordHasher; // 🔹 thêm hasher

        public UserRepository(UserAppDbContext dbcontext)
        {
            _dbcontext = dbcontext;
            _passwordHasher = new PasswordHasher<User>(); // khởi tạo
        }

        public async Task<bool> AddUser(UserDTO user)
        {
            var existingUser = await _dbcontext.user
       .FirstOrDefaultAsync(u => u.Username == user.Username );

            if (existingUser != null)
            {
                // Đã tồn tại
                return false;
            }
            var newUser = new User
            {
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                RoleID = (user.RoleID == 1 || user.RoleID == 2) ? user.RoleID : 3,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, user.PasswordHash);

            _dbcontext.user.Add(newUser);
            await _dbcontext.SaveChangesAsync();
            return true;
        }


        public async Task<User> GetUserByUsername(string username)
        {
            // Thêm Include(u => u.Role) vào đây
            return await _dbcontext.user
                                 .Include(u => u.Role)
                                 .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<IEnumerable<UserDTO>> GetAllUsers()
        {
            var users = await _dbcontext.user
                .Include(u => u.Role)
                .Select(u => new UserDTO
                {
                    UserID = u.UserID,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    RoleID = u.RoleID,
                    RoleName = u.Role.RoleName
                })
                .ToListAsync();

            return users;
        }



        public async Task<bool> UpdateUser(UserDTO user)
        {
            var existingUser = await _dbcontext.user.FindAsync(user.UserID);
            if (existingUser == null)
                return false;

            existingUser.Username = user.Username;
            existingUser.Email = user.Email;
            existingUser.FullName = user.FullName;
            existingUser.UpdatedAt = DateTime.Now;

            // Nếu bạn muốn cập nhật mật khẩu (tùy chọn):
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                existingUser.PasswordHash = _passwordHasher.HashPassword(existingUser, user.PasswordHash);
            }

            _dbcontext.user.Update(existingUser);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUser(int userId)
        {
            var user = await _dbcontext.user.FindAsync(userId);
            if (user == null)
                return false;

            _dbcontext.user.Remove(user);
            await _dbcontext.SaveChangesAsync();
            return true;
        }




        public Task<User> GetUser(int userId)
        {
            throw new NotImplementedException();
        }

        public Task<User?> LoginAsync(LoginDTO loginDto)
        {
            throw new NotImplementedException();
        }
        public async Task<bool> ChangePassword(ChangePasswordDTO changeDto)
        {
            var user = await _dbcontext.user.FirstOrDefaultAsync(u => u.Username == changeDto.Username);
            if (user == null)
                return false;

            var verify = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, changeDto.OldPassword);
            if (verify != PasswordVerificationResult.Success)
                return false;

            // Hash mật khẩu mới
            user.PasswordHash = _passwordHasher.HashPassword(user, changeDto.NewPassword);
            user.UpdatedAt = DateTime.Now;

            _dbcontext.user.Update(user);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserDTO>> GetAllStudents(string rolename)
        {
            var students = await _dbcontext.user
                .Where(u => u.Role.RoleName == rolename) // ✅ chỉ lấy từ bảng User, không cần Role
                .Select(u => new UserDTO
                {
                    UserID = u.UserID,
                    Username = u.Username,
                    FullName = u.FullName,

                })
                .ToListAsync();

            return students;
        }

        public async Task<Role> GetRoleById(int roleId)
        {
            return await _dbcontext.role.FindAsync(roleId);
        }



    }
}
