using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace OfficeFishing.EditorTools
{
    public static class BuildScript
    {
        private static readonly string[] Scenes =
        {
            "Assets/Scenes/MainMenu.unity",
            "Assets/Scenes/GameScene.unity"
        };

        private static readonly string ProjectName = "办公室摸鱼大战";

        [MenuItem("Build/Build Windows (x64)")]
        public static void BuildWindows64()
        {
            string buildPath = GetBuildPath("Windows");
            string exePath = Path.Combine(buildPath, $"{ProjectName}.exe");

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = GetValidScenes(),
                locationPathName = exePath,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            };

            ExecuteBuild(options, buildPath);
        }

        [MenuItem("Build/Build Windows (x86)")]
        public static void BuildWindows32()
        {
            string buildPath = GetBuildPath("Windows_x86");
            string exePath = Path.Combine(buildPath, $"{ProjectName}.exe");

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = GetValidScenes(),
                locationPathName = exePath,
                target = BuildTarget.StandaloneWindows,
                options = BuildOptions.None
            };

            ExecuteBuild(options, buildPath);
        }

        [MenuItem("Build/Build and Run Windows")]
        public static void BuildAndRunWindows()
        {
            string buildPath = GetBuildPath("Windows");
            string exePath = Path.Combine(buildPath, $"{ProjectName}.exe");

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = GetValidScenes(),
                locationPathName = exePath,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.AutoRunPlayer
            };

            ExecuteBuild(options, buildPath);
        }

        [MenuItem("Build/Clean Build Folder")]
        public static void CleanBuildFolder()
        {
            string buildsRoot = Path.Combine(Directory.GetCurrentDirectory(), "Builds");

            if (Directory.Exists(buildsRoot))
            {
                Directory.Delete(buildsRoot, true);
                Debug.Log("[BuildScript] Build folder cleaned successfully");
            }
            else
            {
                Debug.Log("[BuildScript] No build folder to clean");
            }
        }

        private static string[] GetValidScenes()
        {
            System.Collections.Generic.List<string> validScenes = new System.Collections.Generic.List<string>();

            foreach (string scene in Scenes)
            {
                if (File.Exists(scene))
                {
                    validScenes.Add(scene);
                }
                else
                {
                    Debug.LogWarning($"[BuildScript] Scene not found: {scene}");
                }
            }

            if (validScenes.Count == 0)
            {
                Debug.LogError("[BuildScript] No valid scenes found!");
            }

            return validScenes.ToArray();
        }

        private static string GetBuildPath(string platform)
        {
            string buildPath = Path.Combine(Directory.GetCurrentDirectory(), "Builds", platform);

            if (!Directory.Exists(buildPath))
            {
                Directory.CreateDirectory(buildPath);
            }

            return buildPath;
        }

        private static void ExecuteBuild(BuildPlayerOptions options, string buildPath)
        {
            Debug.Log($"[BuildScript] Starting build for {options.target}...");
            Debug.Log($"[BuildScript] Output: {options.locationPathName}");

            BuildReport report = BuildPipeline.BuildPlayer(options);
            BuildSummary summary = report.summary;

            if (summary.result == BuildResult.Succeeded)
            {
                Debug.Log($"[BuildScript] Build succeeded!");
                Debug.Log($"[BuildScript] Size: {summary.totalSize / 1024 / 1024} MB");
                Debug.Log($"[BuildScript] Output: {buildPath}");

                EditorUtility.DisplayDialog(
                    "Build Complete",
                    $"Build successful!\n\nSize: {summary.totalSize / 1024 / 1024} MB\nPath: {buildPath}",
                    "OK"
                );
            }
            else
            {
                Debug.LogError($"[BuildScript] Build failed with {summary.totalErrors} errors");
                EditorUtility.DisplayDialog(
                    "Build Failed",
                    $"Build failed with {summary.totalErrors} errors.\nCheck console for details.",
                    "OK"
                );
            }
        }
    }
}
